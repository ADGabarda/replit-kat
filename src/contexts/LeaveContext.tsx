import React, { createContext, useContext, useState, useEffect } from "react";

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "Vacation" | "Sick" | "Maternity" | "Emergency";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  documents?: {
    name: string;
    url: string;
  }[];
}

interface LeaveBalance {
  employeeId: string;
  vacation: number;
  sick: number;
  maternity: number;
  emergency: number;
  vacationUsed: number;
  sickUsed: number;
  emergencyUsed: number;
  maternityUsed: number;
}

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  submitLeaveRequest: (
    request: Omit<LeaveRequest, "id" | "appliedDate" | "status">
  ) => Promise<void>;
  updateLeaveRequestStatus: (
    id: string,
    status: "Pending" | "Approved" | "Rejected",
    approvedBy: string
  ) => Promise<void>;
  getLeaveBalance: (employeeId: string) => LeaveBalance | undefined;
  calculateEndDate: (
    startDate: string,
    days: number,
    leaveType: string
  ) => string;
  validateLeaveDuration: (
    leaveType: string,
    days: number,
    employeeId: string
  ) => { isValid: boolean; message?: string };
  getStats: () => {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

// Storage keys
const LEAVE_REQUESTS_KEY = "afflatus_leave_requests";
const LEAVE_BALANCES_KEY = "afflatus_leave_balances";

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error("useLeave must be used within a LeaveProvider");
  }
  return context;
};

// Load data from localStorage
const loadLeaveRequests = (): LeaveRequest[] => {
  const stored = localStorage.getItem(LEAVE_REQUESTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

const loadLeaveBalances = (): LeaveBalance[] => {
  const stored = localStorage.getItem(LEAVE_BALANCES_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize default balances for existing employees
  const defaultBalances: LeaveBalance[] = [
    {
      employeeId: "ADMIN001",
      vacation: 5,
      sick: 5,
      maternity: 0,
      emergency: 5,
      vacationUsed: 0,
      sickUsed: 0,
      emergencyUsed: 0,
      maternityUsed: 0,
    },
    {
      employeeId: "EMP001",
      vacation: 5,
      sick: 5,
      maternity: 0,
      emergency: 5,
      vacationUsed: 0,
      sickUsed: 0,
      emergencyUsed: 0,
      maternityUsed: 0,
    },
    {
      employeeId: "EMP002",
      vacation: 5,
      sick: 5,
      maternity: 105,
      emergency: 5,
      vacationUsed: 0,
      sickUsed: 0,
      emergencyUsed: 0,
      maternityUsed: 0,
    },
    {
      employeeId: "EMP003",
      vacation: 5,
      sick: 5,
      maternity: 0,
      emergency: 5,
      vacationUsed: 0,
      sickUsed: 0,
      emergencyUsed: 0,
      maternityUsed: 0,
    },
    {
      employeeId: "INTERN001",
      vacation: 0,
      sick: 0,
      maternity: 0,
      emergency: 0,
      vacationUsed: 0,
      sickUsed: 0,
      emergencyUsed: 0,
      maternityUsed: 0,
    },
  ];
  localStorage.setItem(LEAVE_BALANCES_KEY, JSON.stringify(defaultBalances));
  return defaultBalances;
};

// Save data to localStorage
const saveLeaveRequests = (requests: LeaveRequest[]) => {
  localStorage.setItem(LEAVE_REQUESTS_KEY, JSON.stringify(requests));
};

const saveLeaveBalances = (balances: LeaveBalance[]) => {
  localStorage.setItem(LEAVE_BALANCES_KEY, JSON.stringify(balances));
};

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);

  // Load data on component mount
  useEffect(() => {
    setLeaveRequests(loadLeaveRequests());
    setLeaveBalances(loadLeaveBalances());
  }, []);

  // Calculate end date based on start date and duration
  const calculateEndDate = (
    startDate: string,
    days: number,
    leaveType: string
  ): string => {
    const start = new Date(startDate);
    let endDate = new Date(start);

    if (leaveType === "Maternity") {
      // For maternity leave, add days directly
      endDate.setDate(start.getDate() + days - 1);
    } else {
      // For other leaves, add working days (skip weekends)
      let addedDays = 0;
      while (addedDays < days - 1) {
        endDate.setDate(endDate.getDate() + 1);
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (endDate.getDay() !== 0 && endDate.getDay() !== 6) {
          addedDays++;
        }
      }
    }

    return endDate.toISOString().split("T")[0];
  };

  // Validate leave duration based on business rules
  const validateLeaveDuration = (
    leaveType: string,
    days: number,
    employeeId: string
  ): { isValid: boolean; message?: string } => {
    const balance = leaveBalances.find((b) => b.employeeId === employeeId);

    if (!balance) {
      return { isValid: false, message: "Employee balance not found" };
    }

    switch (leaveType) {
      case "Vacation":
      case "Sick":
      case "Emergency":
        if (days > 5) {
          return {
            isValid: false,
            message: `${leaveType} leave cannot exceed 5 consecutive days`,
          };
        }
        const usedKey = `${leaveType.toLowerCase()}Used` as keyof LeaveBalance;
        const availableKey = leaveType.toLowerCase() as keyof LeaveBalance;
        const used = balance[usedKey] as number;
        const available = balance[availableKey] as number;

        if (used + days > available) {
          return {
            isValid: false,
            message: `Insufficient ${leaveType.toLowerCase()} leave balance. Available: ${
              available - used
            } days`,
          };
        }
        break;

      case "Maternity":
        const maxMaternity = 105 + 15; // 105 + 15 extension days
        if (days > maxMaternity) {
          return {
            isValid: false,
            message: `Maternity leave cannot exceed ${maxMaternity} days`,
          };
        }
        if (balance.maternityUsed + days > balance.maternity + 15) {
          return {
            isValid: false,
            message: `Insufficient maternity leave balance`,
          };
        }
        break;

      default:
        return { isValid: false, message: "Invalid leave type" };
    }

    return { isValid: true };
  };

  const submitLeaveRequest = async (
    request: Omit<LeaveRequest, "id" | "appliedDate" | "status">
  ): Promise<void> => {
    // Validate leave duration
    const validation = validateLeaveDuration(
      request.type,
      request.days,
      request.employeeId
    );
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now().toString(),
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Pending",
    };

    const updatedRequests = [...leaveRequests, newRequest];
    setLeaveRequests(updatedRequests);
    saveLeaveRequests(updatedRequests);
  };

  const updateLeaveRequestStatus = async (
    id: string,
    status: "Pending" | "Approved" | "Rejected",
    approvedBy: string
  ): Promise<void> => {
    const request = leaveRequests.find((r) => r.id === id);
    if (!request) {
      throw new Error("Leave request not found");
    }

    const updatedRequests = leaveRequests.map((req) =>
      req.id === id
        ? {
            ...req,
            status,
            approvedBy,
            approvedDate: new Date().toISOString().split("T")[0],
          }
        : req
    );

    setLeaveRequests(updatedRequests);
    saveLeaveRequests(updatedRequests);

    // Update leave balance if approved
    if (status === "Approved") {
      const updatedBalances = leaveBalances.map((balance) => {
        if (balance.employeeId === request.employeeId) {
          const newBalance = { ...balance };

          switch (request.type) {
            case "Vacation":
              newBalance.vacationUsed += request.days;
              break;
            case "Sick":
              newBalance.sickUsed += request.days;
              break;
            case "Emergency":
              newBalance.emergencyUsed += request.days;
              break;
            case "Maternity":
              newBalance.maternityUsed += request.days;
              break;
          }

          return newBalance;
        }
        return balance;
      });

      setLeaveBalances(updatedBalances);
      saveLeaveBalances(updatedBalances);
    }
  };

  const getLeaveBalance = (employeeId: string) => {
    return leaveBalances.find((balance) => balance.employeeId === employeeId);
  };

  const getStats = () => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter(
      (req) => req.status === "Pending"
    ).length;
    const approved = leaveRequests.filter(
      (req) => req.status === "Approved"
    ).length;
    const rejected = leaveRequests.filter(
      (req) => req.status === "Rejected"
    ).length;

    return { total, pending, approved, rejected };
  };

  return (
    <LeaveContext.Provider
      value={{
        leaveRequests,
        leaveBalances,
        submitLeaveRequest,
        updateLeaveRequestStatus,
        getLeaveBalance,
        calculateEndDate,
        validateLeaveDuration,
        getStats,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};
