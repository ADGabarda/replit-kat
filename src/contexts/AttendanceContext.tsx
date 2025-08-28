import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  totalHours: number;
  status: "Present" | "Late" | "Absent" | "Undertime";
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceContextType {
  attendanceRecords: AttendanceRecord[];
  timeIn: (employeeId: string) => Promise<void>;
  timeOut: (employeeId: string) => Promise<void>;
  getTodaysAttendance: (employeeId: string) => AttendanceRecord | undefined;
  getEmployeeAttendance: (
    employeeId: string,
    dateFrom?: string,
    dateTo?: string
  ) => AttendanceRecord[];
  getAllAttendanceForDate: (date: string) => AttendanceRecord[];
  editAttendanceRecord: (
    id: string,
    updates: Partial<AttendanceRecord>
  ) => Promise<void>;
  deleteAttendanceRecord: (id: string) => Promise<void>;
  createManualAttendance: (
    employeeId: string,
    date: string,
    timeIn: string,
    timeOut?: string,
    remarks?: string
  ) => Promise<void>;
  getAttendanceStats: (employeeId?: string) => {
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    undertimeDays: number;
    averageHours: number;
  };
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};

const ATTENDANCE_RECORDS_KEY = "afflatus_attendance_records";

const loadAttendanceRecords = (): AttendanceRecord[] => {
  const stored = localStorage.getItem(ATTENDANCE_RECORDS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveAttendanceRecords = (records: AttendanceRecord[]) => {
  localStorage.setItem(ATTENDANCE_RECORDS_KEY, JSON.stringify(records));
};

const calculateHours = (timeIn: string, timeOut: string): number => {
  const inTime = new Date(`2000-01-01 ${timeIn}`);
  const outTime = new Date(`2000-01-01 ${timeOut}`);
  const diffMs = outTime.getTime() - inTime.getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60));
};

const determineStatus = (
  timeIn: string,
  timeOut?: string,
  totalHours?: number
): "Present" | "Late" | "Absent" | "Undertime" => {
  if (!timeIn) return "Absent";

  const inTime = new Date(`2000-01-01 ${timeIn}`);
  const standardStart = new Date(`2000-01-01 08:00:00`);

  const isLate = inTime > standardStart;
  const isUndertime = timeOut && totalHours ? totalHours < 8 : false;

  if (isLate && isUndertime) return "Late";
  if (isLate) return "Late";
  if (isUndertime) return "Undertime";
  return "Present";
};

const formatTime = (date: Date): string => {
  return date.toTimeString().split(" ")[0].substring(0, 5);
};

const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, getUsers } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  const syncWithPayroll = (attendanceRecord: AttendanceRecord) => {
    setTimeout(() => {
      const event = new CustomEvent("attendanceSync", {
        detail: attendanceRecord,
      });
      window.dispatchEvent(event);
    }, 0);
  };

  useEffect(() => {
    setAttendanceRecords(loadAttendanceRecords());
  }, []);

  const timeIn = async (employeeId: string) => {
    const today = getTodayDate();
    const now = new Date();
    const timeInStr = formatTime(now);

    const existingRecord = attendanceRecords.find(
      (record) => record.employeeId === employeeId && record.date === today
    );

    if (existingRecord && existingRecord.timeIn) {
      throw new Error("Already timed in for today");
    }

    const users = getUsers();
    const employee = users.find((u) => u.employeeId === employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId,
      employeeName: employee.name,
      date: today,
      timeIn: timeInStr,
      totalHours: 0,
      status: determineStatus(timeInStr, undefined, undefined),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRecords = existingRecord
      ? attendanceRecords.map((record) =>
          record.id === existingRecord.id
            ? {
                ...record,
                timeIn: timeInStr,
                status: determineStatus(timeInStr, undefined, undefined),
                updatedAt: new Date().toISOString(),
              }
            : record
        )
      : [...attendanceRecords, newRecord];

    setAttendanceRecords(updatedRecords);
    saveAttendanceRecords(updatedRecords);
  };

  const timeOut = async (employeeId: string) => {
    const today = getTodayDate();
    const now = new Date();
    const timeOutStr = formatTime(now);

    const existingRecord = attendanceRecords.find(
      (record) => record.employeeId === employeeId && record.date === today
    );

    if (!existingRecord || !existingRecord.timeIn) {
      throw new Error("Must time in first");
    }

    if (existingRecord.timeOut) {
      throw new Error("Already timed out for today");
    }

    const safeTimeIn = existingRecord.timeIn || "00:00";
    const totalHours = calculateHours(safeTimeIn, timeOutStr);
    const status = determineStatus(safeTimeIn, timeOutStr, totalHours);

    const updatedRecord = {
      ...existingRecord,
      timeOut: timeOutStr,
      totalHours,
      status,
      updatedAt: new Date().toISOString(),
    };

    const updatedRecords = attendanceRecords.map((record) =>
      record.id === existingRecord.id ? updatedRecord : record
    );

    setAttendanceRecords(updatedRecords);
    saveAttendanceRecords(updatedRecords);

    syncWithPayroll(updatedRecord);
  };

  const getTodaysAttendance = (
    employeeId: string
  ): AttendanceRecord | undefined => {
    const today = getTodayDate();
    return attendanceRecords.find(
      (record) => record.employeeId === employeeId && record.date === today
    );
  };

  const getEmployeeAttendance = (
    employeeId: string,
    dateFrom?: string,
    dateTo?: string
  ): AttendanceRecord[] => {
    return attendanceRecords
      .filter((record) => {
        if (record.employeeId !== employeeId) return false;
        if (dateFrom && record.date < dateFrom) return false;
        if (dateTo && record.date > dateTo) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getAllAttendanceForDate = (date: string): AttendanceRecord[] => {
    return attendanceRecords.filter((record) => record.date === date);
  };

  const editAttendanceRecord = async (
    id: string,
    updates: Partial<AttendanceRecord>
  ) => {
    if (
      !user ||
      ![
        "Master Admin",
        "President/CEO",
        "Vice President",
        "IT Head",
        "HR",
        "Admin",
      ].includes(user.role)
    ) {
      throw new Error("Insufficient permissions to edit attendance");
    }

    let syncRecord: AttendanceRecord | null = null;
    const updatedRecords = attendanceRecords.map((record) => {
      if (record.id === id) {
        const updatedRecord = {
          ...record,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        if (updatedRecord.timeIn && updatedRecord.timeOut) {
          updatedRecord.totalHours = calculateHours(
            updatedRecord.timeIn,
            updatedRecord.timeOut
          );
          updatedRecord.status = determineStatus(
            updatedRecord.timeIn,
            updatedRecord.timeOut,
            updatedRecord.totalHours
          );
        } else if (updatedRecord.timeIn) {
          updatedRecord.totalHours = 0;
          updatedRecord.status = determineStatus(
            updatedRecord.timeIn,
            undefined,
            undefined
          );
        }

        syncRecord = updatedRecord;
        return updatedRecord;
      }
      return record;
    });

    setAttendanceRecords(updatedRecords);
    saveAttendanceRecords(updatedRecords);

    if (syncRecord && syncRecord.timeOut && syncRecord.totalHours > 0) {
      syncWithPayroll(syncRecord);
    }
  };

  const deleteAttendanceRecord = async (id: string) => {
    if (
      !user ||
      ![
        "Master Admin",
        "President/CEO",
        "Vice President",
        "IT Head",
        "HR",
        "Admin",
      ].includes(user.role)
    ) {
      throw new Error("Insufficient permissions to delete attendance");
    }

    const updatedRecords = attendanceRecords.filter(
      (record) => record.id !== id
    );
    setAttendanceRecords(updatedRecords);
    saveAttendanceRecords(updatedRecords);
  };

  const createManualAttendance = async (
    employeeId: string,
    date: string,
    timeIn: string,
    timeOut?: string,
    remarks?: string
  ) => {
    if (
      !user ||
      ![
        "Master Admin",
        "President/CEO",
        "Vice President",
        "IT Head",
        "HR",
        "Admin",
      ].includes(user.role)
    ) {
      throw new Error("Insufficient permissions to create manual attendance");
    }

    const users = getUsers();
    const employee = users.find((u) => u.employeeId === employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    const existingRecord = attendanceRecords.find(
      (record) => record.employeeId === employeeId && record.date === date
    );

    if (existingRecord) {
      throw new Error("Attendance record already exists for this date");
    }

    const totalHours = timeOut ? calculateHours(timeIn, timeOut) : 0;
    const status = determineStatus(timeIn, timeOut, totalHours);

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId,
      employeeName: employee.name,
      date,
      timeIn,
      timeOut,
      totalHours,
      status,
      remarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRecords = [...attendanceRecords, newRecord];
    setAttendanceRecords(updatedRecords);
    saveAttendanceRecords(updatedRecords);

    if (newRecord.timeOut && newRecord.totalHours > 0) {
      syncWithPayroll(newRecord);
    }
  };

  const getAttendanceStats = (employeeId?: string) => {
    const filteredRecords = employeeId
      ? attendanceRecords.filter((record) => record.employeeId === employeeId)
      : attendanceRecords;

    const totalDays = filteredRecords.length;
    const presentDays = filteredRecords.filter(
      (record) => record.status === "Present"
    ).length;
    const lateDays = filteredRecords.filter(
      (record) => record.status === "Late"
    ).length;
    const absentDays = filteredRecords.filter(
      (record) => record.status === "Absent"
    ).length;
    const undertimeDays = filteredRecords.filter(
      (record) => record.status === "Undertime"
    ).length;

    const totalHours = filteredRecords.reduce(
      (sum, record) => sum + record.totalHours,
      0
    );
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0;

    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      undertimeDays,
      averageHours,
    };
  };

  return (
    <AttendanceContext.Provider
      value={{
        attendanceRecords,
        timeIn,
        timeOut,
        getTodaysAttendance,
        getEmployeeAttendance,
        getAllAttendanceForDate,
        editAttendanceRecord,
        deleteAttendanceRecord,
        createManualAttendance,
        getAttendanceStats,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};
