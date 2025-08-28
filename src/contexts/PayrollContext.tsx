import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useLeave } from "./LeaveContext";

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  hoursWorked: number;
  hourlyRate: number;
  basicPay: number;
  overtime: number;
  allowances: number;
  commissions: number;
  incentives: number;
  grossPay: number;
  deductions: {
    sss: number;
    philHealth: number;
    pagIbig: number;
    tax: number;
    loans: number;
    totalDeductions: number;
  };
  netPay: number;
  status: "Pending" | "Processed" | "Paid";
  createdAt: string;
  createdBy: string;
}

interface PayrollEditLog {
  id: string;
  payrollId: string;
  editedBy: string;
  editedAt: string;
  fieldChanged: string;
  oldValue: any;
  newValue: any;
  reason?: string;
}

interface TimeRecord {
  employeeId: string;
  date: string;
  hoursWorked: number;
}

interface PayrollContextType {
  payrollRecords: PayrollRecord[];
  payrollEditLogs: PayrollEditLog[];
  timeRecords: TimeRecord[];
  generatePayroll: (
    employeeIds: string[],
    period: string,
    payDate: string
  ) => Promise<void>;
  editPayrollRecord: (
    id: string,
    updates: Partial<PayrollRecord>,
    reason: string
  ) => Promise<void>;
  getPayrollHistory: (employeeId: string) => PayrollRecord[];
  getEditLogs: (payrollId?: string) => PayrollEditLog[];
  downloadPayslip: (payrollId: string) => void;
  logTimeRecord: (employeeId: string, date: string, hours: number) => void;
  bulkLogTimeRecords: (
    records: { employeeId: string; hours: number }[],
    date: string
  ) => void;
  editTimeRecord: (employeeId: string, date: string, newHours: number) => void;
  deleteTimeRecord: (employeeId: string, date: string) => void;
  getTimeRecordForDate: (
    employeeId: string,
    date: string
  ) => TimeRecord | undefined;
  getTimeRecordsForDate: (date: string) => TimeRecord[];
  getUpcomingPayPeriods: () => { period: string; payDate: string }[];
  cleanupOldRecords: () => void;
  syncAttendanceData: (attendanceRecords: any[]) => void;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error("usePayroll must be used within a PayrollProvider");
  }
  return context;
};

// Storage keys
const PAYROLL_RECORDS_KEY = "afflatus_payroll_records";
const PAYROLL_EDIT_LOGS_KEY = "afflatus_payroll_edit_logs";
const TIME_RECORDS_KEY = "afflatus_time_records";

// Constants
const MINIMUM_HOURLY_RATE = 86.88; // PHP minimum wage
const SSS_EE_RATE = 0.045; // 4.5% for employee
const SSS_ER_RATE = 0.085; // 8.5% for employer
const SSS_PENBOOST_THRESHOLD = 20250; // Threshold for PenBoost
const PHILHEALTH_RATE = 0.05; // 5% of gross salary
const PAGIBIG_EE_RATE = 0.01; // 1% for employee
const PAGIBIG_ER_RATE = 0.02; // 2% for employer

// Load data from localStorage
const loadPayrollRecords = (): PayrollRecord[] => {
  const stored = localStorage.getItem(PAYROLL_RECORDS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const loadEditLogs = (): PayrollEditLog[] => {
  const stored = localStorage.getItem(PAYROLL_EDIT_LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const loadTimeRecords = (): TimeRecord[] => {
  const stored = localStorage.getItem(TIME_RECORDS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save data to localStorage
const savePayrollRecords = (records: PayrollRecord[]) => {
  localStorage.setItem(PAYROLL_RECORDS_KEY, JSON.stringify(records));
};

const saveEditLogs = (logs: PayrollEditLog[]) => {
  localStorage.setItem(PAYROLL_EDIT_LOGS_KEY, JSON.stringify(logs));
};

const saveTimeRecords = (records: TimeRecord[]) => {
  localStorage.setItem(TIME_RECORDS_KEY, JSON.stringify(records));
};

// Utility functions
const calculateSSS = (grossPay: number): number => {
  const monthlySalary = grossPay * 2; // Semi-monthly to monthly

  if (monthlySalary >= SSS_PENBOOST_THRESHOLD) {
    // Apply PenBoost calculation
    return monthlySalary * SSS_EE_RATE;
  } else {
    // Regular SSS calculation
    return monthlySalary * SSS_EE_RATE;
  }
};

const calculatePhilHealth = (grossPay: number): number => {
  return grossPay * PHILHEALTH_RATE;
};

const calculatePagIbig = (grossPay: number): number => {
  return grossPay * PAGIBIG_EE_RATE;
};

const calculateTax = (grossPay: number): number => {
  // Simplified tax calculation (you may want to implement proper tax brackets)
  const annualGross = grossPay * 24; // Semi-monthly to annual

  if (annualGross <= 250000) return 0;
  if (annualGross <= 400000) return ((annualGross - 250000) * 0.2) / 24;
  if (annualGross <= 800000)
    return (30000 + (annualGross - 400000) * 0.25) / 24;
  if (annualGross <= 2000000)
    return (130000 + (annualGross - 800000) * 0.3) / 24;
  if (annualGross <= 8000000)
    return (490000 + (annualGross - 2000000) * 0.32) / 24;

  return (2410000 + (annualGross - 8000000) * 0.35) / 24;
};

const getNextPayPeriods = (): { period: string; payDate: string }[] => {
  const periods = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  for (let i = 0; i < 6; i++) {
    const monthOffset = Math.floor(i / 2);
    const month = currentMonth + monthOffset;
    const year = currentYear + Math.floor(month / 12);
    const adjustedMonth = month % 12;

    const is15th = i % 2 === 0;
    const startDay = is15th ? 1 : 16;
    const endDay = is15th ? 15 : new Date(year, adjustedMonth + 1, 0).getDate();
    const payDay = is15th ? 15 : endDay;

    // Create proper date strings in YYYY-MM-DD format
    const startDate = new Date(year, adjustedMonth, startDay)
      .toISOString()
      .split("T")[0];
    const endDate = new Date(year, adjustedMonth, endDay)
      .toISOString()
      .split("T")[0];
    const period = `${startDate} - ${endDate}`;
    const payDate = new Date(year, adjustedMonth, payDay)
      .toISOString()
      .split("T")[0];

    periods.push({ period, payDate });
  }

  return periods;
};

export const PayrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, getAllUsers } = useAuth();
  const { leaveRequests } = useLeave();
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [payrollEditLogs, setPayrollEditLogs] = useState<PayrollEditLog[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);

  useEffect(() => {
    setPayrollRecords(loadPayrollRecords());
    setPayrollEditLogs(loadEditLogs());
    setTimeRecords(loadTimeRecords());

    // Listen for attendance sync events
    const handleAttendanceSync = (event: CustomEvent) => {
      const attendanceRecord = event.detail;
      if (attendanceRecord && attendanceRecord.totalHours > 0) {
        // Use functional update to avoid dependency on timeRecords
        setTimeRecords((currentRecords) => {
          const updatedRecords = [...currentRecords];
          const existingRecordIndex = updatedRecords.findIndex(
            (r) =>
              r.employeeId === attendanceRecord.employeeId &&
              r.date === attendanceRecord.date
          );

          if (existingRecordIndex > -1) {
            updatedRecords[existingRecordIndex].hoursWorked =
              attendanceRecord.totalHours;
          } else {
            updatedRecords.push({
              employeeId: attendanceRecord.employeeId,
              date: attendanceRecord.date,
              hoursWorked: attendanceRecord.totalHours,
            });
          }

          saveTimeRecords(updatedRecords);
          return updatedRecords;
        });
      }
    };

    window.addEventListener(
      "attendanceSync",
      handleAttendanceSync as EventListener
    );

    return () => {
      window.removeEventListener(
        "attendanceSync",
        handleAttendanceSync as EventListener
      );
    };
  }, []); // Remove timeRecords dependency

  const logTimeRecord = (employeeId: string, date: string, hours: number) => {
    setTimeRecords((currentRecords) => {
      const updatedRecords = [...currentRecords];
      const existingRecordIndex = updatedRecords.findIndex(
        (r) => r.employeeId === employeeId && r.date === date
      );

      if (existingRecordIndex > -1) {
        updatedRecords[existingRecordIndex].hoursWorked = hours;
      } else {
        updatedRecords.push({ employeeId, date, hoursWorked: hours });
      }

      saveTimeRecords(updatedRecords);
      return updatedRecords;
    });
  };

  const bulkLogTimeRecords = (
    records: { employeeId: string; hours: number }[],
    date: string
  ) => {
    setTimeRecords((currentRecords) => {
      const updatedRecords = [...currentRecords];
      records.forEach((record) => {
        const existingRecordIndex = updatedRecords.findIndex(
          (r) => r.employeeId === record.employeeId && r.date === date
        );
        if (existingRecordIndex > -1) {
          updatedRecords[existingRecordIndex].hoursWorked = record.hours;
        } else {
          updatedRecords.push({
            employeeId: record.employeeId,
            date,
            hoursWorked: record.hours,
          });
        }
      });
      saveTimeRecords(updatedRecords);
      return updatedRecords;
    });
  };

  const editTimeRecord = (
    employeeId: string,
    date: string,
    newHours: number
  ) => {
    setTimeRecords((currentRecords) => {
      const updatedRecords = currentRecords.map((record) =>
        record.employeeId === employeeId && record.date === date
          ? { ...record, hoursWorked: newHours }
          : record
      );
      saveTimeRecords(updatedRecords);
      return updatedRecords;
    });
  };

  const deleteTimeRecord = (employeeId: string, date: string) => {
    setTimeRecords((currentRecords) => {
      const updatedRecords = currentRecords.filter(
        (record) => !(record.employeeId === employeeId && record.date === date)
      );
      saveTimeRecords(updatedRecords);
      return updatedRecords;
    });
  };

  const getTimeRecordForDate = (
    employeeId: string,
    date: string
  ): TimeRecord | undefined => {
    return timeRecords.find(
      (record) => record.employeeId === employeeId && record.date === date
    );
  };

  const getTimeRecordsForDate = (date: string): TimeRecord[] => {
    return timeRecords.filter((record) => record.date === date);
  };

  const syncAttendanceData = (attendanceRecords: any[]) => {
    // Function to bulk sync attendance data with time records
    setTimeRecords((currentRecords) => {
      const newTimeRecords: TimeRecord[] = [];

      attendanceRecords.forEach((record) => {
        if (record.totalHours > 0) {
          const existingIndex = currentRecords.findIndex(
            (tr) =>
              tr.employeeId === record.employeeId && tr.date === record.date
          );

          if (existingIndex === -1) {
            newTimeRecords.push({
              employeeId: record.employeeId,
              date: record.date,
              hoursWorked: record.totalHours,
            });
          }
        }
      });

      if (newTimeRecords.length > 0) {
        const updatedRecords = [...currentRecords, ...newTimeRecords];
        saveTimeRecords(updatedRecords);
        return updatedRecords;
      }

      return currentRecords;
    });
  };

  const calculatePayroll = (
    employeeId: string,
    payPeriodStart: string,
    payPeriodEnd: string
  ): PayrollRecord => {
    const users = getAllUsers();
    const employee = users.find((u) => u.employeeId === employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Validate date strings
    const startDate = new Date(payPeriodStart);
    const endDate = new Date(payPeriodEnd);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date values provided for payroll calculation");
    }

    // Calculate worked hours from time records with more precision
    const periodTimeRecords = timeRecords.filter(
      (record) =>
        record.employeeId === employeeId &&
        record.date >= payPeriodStart &&
        record.date <= payPeriodEnd
    );

    const totalHours = periodTimeRecords.reduce(
      (sum, record) => sum + record.hoursWorked,
      0
    );

    // Calculate leave hours with proper overlap handling
    const periodLeaveRequests = leaveRequests.filter(
      (request) =>
        request.employeeId === employeeId &&
        request.status === "Approved" &&
        request.startDate <= payPeriodEnd &&
        request.endDate >= payPeriodStart
    );

    // Calculate actual leave days within the pay period
    let leaveHours = 0;
    periodLeaveRequests.forEach((request) => {
      const leaveStart = new Date(
        Math.max(new Date(request.startDate).getTime(), startDate.getTime())
      );
      const leaveEnd = new Date(
        Math.min(new Date(request.endDate).getTime(), endDate.getTime())
      );

      if (leaveStart <= leaveEnd) {
        const daysDiff =
          Math.ceil(
            (leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        // Only count weekdays for most leave types, all days for maternity
        const workDays =
          request.type === "Maternity"
            ? daysDiff
            : Array.from({ length: daysDiff }, (_, i) => {
                const date = new Date(leaveStart);
                date.setDate(date.getDate() + i);
                return date.getDay();
              }).filter((day) => day !== 0 && day !== 6).length;

        leaveHours += workDays * 8;
      }
    });

    // Calculate working days in the period for accurate standard hours
    const workingDays = Array.from(
      {
        length:
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1,
      },
      (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return date.getDay();
      }
    ).filter((day) => day !== 0 && day !== 6).length;

    const standardHours = workingDays * 8;
    const totalWorkedHours = totalHours + leaveHours;
    const overtimeHours = Math.max(0, totalWorkedHours - standardHours);
    const regularHours = Math.min(totalWorkedHours, standardHours);

    // Role-based hourly rate calculation
    const getHourlyRate = (role: string): number => {
      switch (role) {
        case "Master Admin":
        case "President/CEO":
          return MINIMUM_HOURLY_RATE * 3; // 3x minimum wage
        case "Vice President":
        case "IT Head":
          return MINIMUM_HOURLY_RATE * 2.5; // 2.5x minimum wage
        case "HR":
        case "Admin":
          return MINIMUM_HOURLY_RATE * 2; // 2x minimum wage
        case "Employee":
          return MINIMUM_HOURLY_RATE * 1.5; // 1.5x minimum wage
        case "Intern":
          return MINIMUM_HOURLY_RATE * 0.8; // 80% of minimum wage
        default:
          return MINIMUM_HOURLY_RATE;
      }
    };

    const hourlyRate = getHourlyRate(employee.role);
    const basicPay = regularHours * hourlyRate;
    const overtime = overtimeHours * hourlyRate * 1.25; // 25% overtime premium

    // Role-based allowances
    const getAllowances = (role: string): number => {
      switch (role) {
        case "Master Admin":
        case "President/CEO":
          return 8000;
        case "Vice President":
        case "IT Head":
          return 6000;
        case "HR":
        case "Admin":
          return 4000;
        case "Employee":
          return 3000;
        case "Intern":
          return 1000;
        default:
          return 3000;
      }
    };

    const allowances = getAllowances(employee.role);
    const commissions = 0; // Can be set based on performance
    const incentives = 0; // Can be set based on performance

    const grossPay =
      basicPay + overtime + allowances + commissions + incentives;

    // Calculate deductions
    const sss = calculateSSS(grossPay);
    const philHealth = calculatePhilHealth(grossPay);
    const pagIbig = calculatePagIbig(grossPay);
    const tax = calculateTax(grossPay);
    const loans = 0; // Can be set based on employee loans

    const totalDeductions = sss + philHealth + pagIbig + tax + loans;
    const netPay = grossPay - totalDeductions;

    const period = `${payPeriodStart} - ${payPeriodEnd}`;
    const payDate = new Date(payPeriodEnd);
    payDate.setDate(payDate.getDate() + 1); // Pay day after period end

    return {
      id: Date.now().toString(),
      employeeId,
      employeeName: employee.name,
      period,
      payPeriodStart,
      payPeriodEnd,
      payDate: payDate.toISOString().split("T")[0],
      hoursWorked: totalWorkedHours,
      hourlyRate: hourlyRate,
      basicPay,
      overtime,
      allowances,
      commissions,
      incentives,
      grossPay,
      deductions: {
        sss,
        philHealth,
        pagIbig,
        tax,
        loans,
        totalDeductions,
      },
      netPay,
      status: "Pending",
      createdAt: new Date().toISOString(),
      createdBy: user?.employeeId || "SYSTEM",
    };
  };

  const generatePayroll = async (
    employeeIds: string[],
    period: string,
    payDate: string
  ): Promise<void> => {
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
      throw new Error("Insufficient permissions to generate payroll");
    }

    // Role-specific restrictions
    if (user.role === "Admin" && employeeIds.length > 10) {
      throw new Error(
        "Admin role can only generate payroll for up to 10 employees at once"
      );
    }

    try {
      const users = getAllUsers();
      const [startStr, endStr] = period.split(" - ");

      // Validate date strings before parsing
      if (!startStr || !endStr) {
        throw new Error("Invalid pay period format");
      }

      const payPeriodStart = startStr.trim();
      const payPeriodEnd = endStr.trim();

      // Validate that dates are valid
      const startDate = new Date(payPeriodStart);
      const endDate = new Date(payPeriodEnd);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date values in pay period");
      }

      const newRecords: PayrollRecord[] = [];

      for (const employeeId of employeeIds) {
        // Skip if payroll already exists for this period
        const existingRecord = payrollRecords.find(
          (record) =>
            record.employeeId === employeeId &&
            record.payPeriodStart === payPeriodStart &&
            record.payPeriodEnd === payPeriodEnd
        );

        if (!existingRecord) {
          const payrollRecord = calculatePayroll(
            employeeId,
            payPeriodStart,
            payPeriodEnd
          );
          newRecords.push(payrollRecord);
        }
      }

      const updatedRecords = [...payrollRecords, ...newRecords];
      setPayrollRecords(updatedRecords);
      savePayrollRecords(updatedRecords);

      // Clean up old records after generating new ones
      cleanupOldRecords();
    } catch (error) {
      throw error;
    }
  };

  const editPayrollRecord = async (
    id: string,
    updates: Partial<PayrollRecord>,
    reason?: string
  ): Promise<void> => {
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
      throw new Error("Insufficient permissions to edit payroll");
    }

    const record = payrollRecords.find((r) => r.id === id);
    if (!record) {
      throw new Error("Payroll record not found");
    }

    const updatedRecords = payrollRecords.map((r) => {
      if (r.id === id) {
        return { ...r, ...updates };
      }
      return r;
    });

    // Log all changes
    const editLogs: PayrollEditLog[] = [];
    Object.keys(updates).forEach((field) => {
      if ((updates as any)[field] !== (record as any)[field]) {
        editLogs.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          payrollId: id,
          editedBy: user.employeeId,
          editedAt: new Date().toISOString(),
          fieldChanged: field,
          oldValue: (record as any)[field],
          newValue: (updates as any)[field],
          reason,
        });
      }
    });

    const updatedLogs = [...payrollEditLogs, ...editLogs];

    setPayrollRecords(updatedRecords);
    setPayrollEditLogs(updatedLogs);
    savePayrollRecords(updatedRecords);
    saveEditLogs(updatedLogs);
  };

  const processPayroll = async (id: string): Promise<void> => {
    const updatedRecords = payrollRecords.map((record) =>
      record.id === id ? { ...record, status: "Processed" as const } : record
    );

    setPayrollRecords(updatedRecords);
    savePayrollRecords(updatedRecords);
  };

  const getPayrollHistory = (employeeId: string) => {
    return payrollRecords.filter((record) => record.employeeId === employeeId);
  };

  const getEditLogs = (payrollId?: string) => {
    if (payrollId) {
      return payrollEditLogs.filter((log) => log.payrollId === payrollId);
    }
    return payrollEditLogs;
  };

  const downloadPayslip = async (payrollId: string): Promise<void> => {
    const record = payrollRecords.find((r) => r.id === payrollId);
    if (!record) {
      throw new Error("Payroll record not found");
    }

    // Create PDF content (simplified - in production, use a proper PDF library)
    const pdfContent = `
      AFFLATUS REALTY INC.
      PAYSLIP

      Employee: ${record.employeeName} (${record.employeeId})
      Pay Period: ${record.period}
      Pay Date: ${new Date(record.payDate).toLocaleDateString()}

      EARNINGS:
      Basic Pay (${record.hoursWorked} hrs @ ₱${
      record.hourlyRate
    }/hr): ₱${record.basicPay.toLocaleString()}
      Overtime: ₱${record.overtime.toLocaleString()}
      Allowances: ₱${record.allowances.toLocaleString()}
      Commissions: ₱${record.commissions.toLocaleString()}
      Incentives: ₱${record.incentives.toLocaleString()}
      Gross Pay: ₱${record.grossPay.toLocaleString()}

      DEDUCTIONS:
      SSS: ₱${record.deductions.sss.toLocaleString()}
      PhilHealth: ₱${record.deductions.philHealth.toLocaleString()}
      Pag-IBIG: ₱${record.deductions.pagIbig.toLocaleString()}
      Tax: ₱${record.deductions.tax.toLocaleString()}
      Loans: ₱${record.deductions.loans.toLocaleString()}
      Total Deductions: ₱${record.deductions.totalDeductions.toLocaleString()}

      NET PAY: ₱${record.netPay.toLocaleString()}

      This payslip is password protected with your account password.
    `;

    // Create downloadable file
    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payslip_${record.employeeId}_${record.period.replace(
      /[/\\?%*:|"<>]/g,
      "_"
    )}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getUpcomingPayPeriods = () => {
    return getNextPayPeriods();
  };

  const cleanupOldRecords = () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const filteredRecords = payrollRecords.filter(
      (record) => new Date(record.createdAt) >= threeMonthsAgo
    );

    if (filteredRecords.length !== payrollRecords.length) {
      setPayrollRecords(filteredRecords);
      savePayrollRecords(filteredRecords);

      // Show warning about deleted records
      console.warn(
        `${
          payrollRecords.length - filteredRecords.length
        } old payroll records have been automatically deleted to maintain only 3 months of data.`
      );

      // Also cleanup related edit logs
      const validPayrollIds = filteredRecords.map((r) => r.id);
      const filteredLogs = payrollEditLogs.filter((log) =>
        validPayrollIds.includes(log.payrollId)
      );

      setPayrollEditLogs(filteredLogs);
      saveEditLogs(filteredLogs);
    }
  };

  // Run cleanup on component mount and periodically
  useEffect(() => {
    cleanupOldRecords();
    const interval = setInterval(cleanupOldRecords, 24 * 60 * 60 * 1000); // Daily cleanup
    return () => clearInterval(interval);
  }, [payrollRecords, payrollEditLogs]);

  return (
    <PayrollContext.Provider
      value={{
        payrollRecords,
        payrollEditLogs,
        timeRecords,
        generatePayroll,
        editPayrollRecord,
        getPayrollHistory,
        getEditLogs,
        downloadPayslip,
        logTimeRecord,
        bulkLogTimeRecords,
        editTimeRecord,
        deleteTimeRecord,
        getTimeRecordForDate,
        getTimeRecordsForDate,
        getUpcomingPayPeriods,
        cleanupOldRecords,
        syncAttendanceData,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};
