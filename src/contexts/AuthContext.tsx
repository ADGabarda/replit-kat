import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  employeeId: string;
  name: string;
  role:
    | "Master Admin"
    | "President/CEO"
    | "Vice President"
    | "IT Head"
    | "HR"
    | "Employee"
    | "Intern";
  department: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };
  employmentType: string;
  status: string;
  hireDate: string;
  createdBy?: string;
  createdAt?: string;
}

interface AccessRequest {
  id: string;
  userId: string;
  userRole: string;
  userName: string;
  resource: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'denied';
  approvedBy?: string;
  approvedDate?: string;
}

interface AuthContextType {
  user: User | null;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
  createUser: (userData: CreateUserData) => Promise<User>;
  getAllUsers: () => User[];
  getUsers: () => User[];
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  isLoading: boolean;
  requestAccess: (resource: string) => Promise<void>;
  getAccessRequests: () => AccessRequest[];
  approveAccessRequest: (requestId: string) => Promise<void>;
  denyAccessRequest: (requestId: string) => Promise<void>;
  hasAccess: (resource: string) => boolean;
}

interface CreateUserData {
  name: string;
  role: User["role"];
  department: string;
  email: string;
  phone: string;
  address: string;
  employmentType: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Demo users
const demoUsers: User[] = [
  {
    id: "0",
    employeeId: "ADMIN001",
    name: "System Administrator",
    role: "Master Admin",
    department: "Information Technology",
    email: "admin@afflatus.com",
    phone: "+63 917 000 0000",
    address: "Afflatus Realty Inc. Main Office",
    emergencyContact: {
      name: "Emergency Contact",
      relationship: "Company",
      phone: "+63 917 000 0001",
      address: "Afflatus Realty Inc. Main Office",
    },
    employmentType: "Regular",
    status: "Active",
    hireDate: "2020-01-01",
    createdAt: "2020-01-01",
  },
  {
    id: "1",
    employeeId: "EMP001",
    name: "Juan Carlos Dela Cruz",
    role: "President/CEO",
    department: "Executive",
    email: "juan.delacruz@afflatus.com",
    phone: "+63 917 123 4567",
    address: "123 Makati Ave, Makati City, Metro Manila",
    emergencyContact: {
      name: "Maria Dela Cruz",
      relationship: "Spouse",
      phone: "+63 917 765 4321",
      address: "123 Makati Ave, Makati City, Metro Manila",
    },
    employmentType: "Regular",
    status: "Active",
    hireDate: "2020-01-15",
  },
  {
    id: "2",
    employeeId: "EMP002",
    name: "Maria Santos Rodriguez",
    role: "HR",
    department: "Human Resources",
    email: "maria.santos@afflatus.com",
    phone: "+63 917 234 5678",
    address: "456 BGC Blvd, Taguig City, Metro Manila",
    emergencyContact: {
      name: "Jose Rodriguez",
      relationship: "Spouse",
      phone: "+63 917 876 5432",
      address: "456 BGC Blvd, Taguig City, Metro Manila",
    },
    employmentType: "Regular",
    status: "Active",
    hireDate: "2020-03-01",
  },
  {
    id: "3",
    employeeId: "EMP003",
    name: "Roberto Miguel Fernandez",
    role: "Employee",
    department: "Sales",
    email: "roberto.fernandez@afflatus.com",
    phone: "+63 917 345 6789",
    address: "789 Ortigas Ave, Pasig City, Metro Manila",
    emergencyContact: {
      name: "Carmen Fernandez",
      relationship: "Mother",
      phone: "+63 917 987 6543",
      address: "789 Ortigas Ave, Pasig City, Metro Manila",
    },
    employmentType: "Regular",
    status: "Active",
    hireDate: "2021-06-15",
  },
];

// Store users in localStorage for persistence
const USERS_STORAGE_KEY = "afflatus_hr_users";
const ACCESS_REQUESTS_STORAGE_KEY = "afflatus_access_requests";
const USER_SESSIONS_STORAGE_KEY = "afflatus_user_sessions";

const loadUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with demo users
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(demoUsers));
  return demoUsers;
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const loadAccessRequests = (): AccessRequest[] => {
  const stored = localStorage.getItem(ACCESS_REQUESTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveAccessRequests = (requests: AccessRequest[]) => {
  localStorage.setItem(ACCESS_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
};

const loadUserSessions = (): Record<string, string[]> => {
  const stored = localStorage.getItem(USER_SESSIONS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveUserSessions = (sessions: Record<string, string[]>) => {
  localStorage.setItem(USER_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
};

// Password generation utility
const generatePassword = (role: User["role"]): string => {
  const chars = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    special: "!@#$%^&*",
  };

  const getRandomChar = (charset: string) =>
    charset[Math.floor(Math.random() * charset.length)];

  if (
    role === "Master Admin" ||
    role === "President/CEO" ||
    role === "Vice President" ||
    role === "IT Head"
  ) {
    // Executive level: 8 characters with mixed case, numbers, and special chars
    return Array.from({ length: 8 }, () => {
      const charSets = [
        chars.uppercase,
        chars.lowercase,
        chars.numbers,
        chars.special,
      ];
      const randomSet = charSets[Math.floor(Math.random() * charSets.length)];
      return getRandomChar(randomSet);
    }).join("");
  } else {
    // Staff level: 6 characters with mixed case and numbers
    return Array.from({ length: 6 }, () => {
      const charSets = [chars.uppercase, chars.lowercase, chars.numbers];
      const randomSet = charSets[Math.floor(Math.random() * charSets.length)];
      return getRandomChar(randomSet);
    }).join("");
  }
};

const generateEmployeeId = (role: User["role"]): string => {
  const users = loadUsers();
  const prefix =
    role === "Master Admin"
      ? "ADMIN"
      : role === "President/CEO"
      ? "CEO"
      : role === "Vice President"
      ? "VP"
      : role === "IT Head"
      ? "IT"
      : role === "HR"
      ? "HR"
      : role === "Intern"
      ? "INT"
      : "EMP";

  let counter = 1;
  let employeeId: string;

  do {
    employeeId = `${prefix}${counter.toString().padStart(3, "0")}`;
    counter++;
  } while (users.some((user) => user.employeeId === employeeId));

  return employeeId;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [userSessions, setUserSessions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Load users from storage
    const loadedUsers = loadUsers();
    setUsers(loadedUsers);

    // Load access requests
    const loadedRequests = loadAccessRequests();
    setAccessRequests(loadedRequests);

    // Load user sessions
    const loadedSessions = loadUserSessions();
    setUserSessions(loadedSessions);

    // Check for stored user session
    const storedUser = localStorage.getItem("hr_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Verify user still exists in the system
      const currentUser = loadedUsers.find((u) => u.id === parsedUser.id);
      if (currentUser) {
        setUser(currentUser);
      } else {
        localStorage.removeItem("hr_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (employeeId: string, password: string) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find user in current users list
      const foundUser = users.find((u) => u.employeeId === employeeId);

      if (!foundUser) {
        throw new Error("Invalid Employee ID or password");
      }

      // Password validation (in production, use proper hashing)
      const validPasswords: { [key: string]: string } = {
        ADMIN001: "admin123",
        EMP001: "admin123",
        EMP002: "hr123",
        EMP003: "emp123",
      };

      // For demo purposes, allow the stored password or default passwords
      const isValidPassword =
        validPasswords[employeeId] === password ||
        (foundUser as any).generatedPassword === password;

      if (!isValidPassword) {
        throw new Error("Invalid Employee ID or password");
      }

      setUser(foundUser);
      localStorage.setItem("hr_user", JSON.stringify(foundUser));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      // Clear user's session access when they log out
      const updatedSessions = { ...userSessions };
      delete updatedSessions[user.id];
      setUserSessions(updatedSessions);
      saveUserSessions(updatedSessions);
    }
    setUser(null);
    localStorage.removeItem("hr_user");
  };

  const createUser = async (userData: CreateUserData): Promise<User> => {
    if (!user || (user.role !== "Master Admin" && user.role !== "IT Head")) {
      throw new Error("Only Master Admin or IT Head can create users");
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const employeeId = generateEmployeeId(userData.role);
      const generatedPassword = generatePassword(userData.role);

      const newUser: User = {
        id: Date.now().toString(),
        employeeId,
        ...userData,
        status: "Active",
        hireDate: new Date().toISOString().split("T")[0],
        createdBy: user.employeeId,
        createdAt: new Date().toISOString(),
      };

      // Store generated password temporarily for display
      (newUser as any).generatedPassword = generatedPassword;

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveUsers(updatedUsers);

      // Initialize leave balance for the new employee
      const leaveBalances = JSON.parse(
        localStorage.getItem("afflatus_leave_balances") || "[]"
      );
      const newBalance = {
        employeeId: newUser.employeeId,
        vacation: 5,
        sick: 5,
        maternity:
          userData.role === "HR" || userData.role === "Employee" ? 105 : 0,
        emergency: 5,
        vacationUsed: 0,
        sickUsed: 0,
        emergencyUsed: 0,
        maternityUsed: 0,
      };
      leaveBalances.push(newBalance);
      localStorage.setItem(
        "afflatus_leave_balances",
        JSON.stringify(leaveBalances)
      );

      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllUsers = (): User[] => {
    if (!user || ![
      "Master Admin", 
      "IT Head", 
      "President/CEO", 
      "Vice President", 
      "HR", 
      "Admin"
    ].includes(user.role)) {
      throw new Error("Insufficient permissions to view all users");
    }
    return users;
  };

  const getUsers = (): User[] => {
    return users;
  };

  const updateUser = async (
    id: string,
    updates: Partial<User>
  ): Promise<void> => {
    if (!user || (user.role !== "Master Admin" && user.role !== "IT Head")) {
      throw new Error("Only Master Admin or IT Head can update users");
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedUsers = users.map((u) =>
        u.id === id ? { ...u, ...updates } : u
      );

      setUsers(updatedUsers);
      saveUsers(updatedUsers);

      // Update current user if they updated themselves
      if (user.id === id) {
        const updatedCurrentUser = updatedUsers.find((u) => u.id === id);
        if (updatedCurrentUser) {
          setUser(updatedCurrentUser);
          localStorage.setItem("hr_user", JSON.stringify(updatedCurrentUser));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    if (!user || (user.role !== "Master Admin" && user.role !== "IT Head")) {
      throw new Error("Only Master Admin or IT Head can delete users");
    }

    if (user.id === id) {
      throw new Error("Cannot delete your own account");
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedUsers = users.filter((u) => u.id !== id);
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
    } finally {
      setIsLoading(false);
    }
  };

  const requestAccess = async (resource: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const newRequest: AccessRequest = {
      id: Date.now().toString(),
      userId: user.id,
      userRole: user.role,
      userName: user.name,
      resource,
      requestDate: new Date().toISOString(),
      status: 'pending'
    };

    const updatedRequests = [...accessRequests, newRequest];
    setAccessRequests(updatedRequests);
    saveAccessRequests(updatedRequests);
  };

  const getAccessRequests = (): AccessRequest[] => {
    if (!user || (user.role !== "Master Admin" && user.role !== "IT Head")) {
      return [];
    }
    return accessRequests;
  };

  const approveAccessRequest = async (requestId: string): Promise<void> => {
    if (!user || (user.role !== "Master Admin" && user.role !== "IT Head")) {
      throw new Error("Only Master Admin or IT Head can approve access requests");
    }

    const updatedRequests = accessRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'approved' as const,
          approvedBy: user.employeeId,
          approvedDate: new Date().toISOString()
        };
      }
      return req;
    });

    setAccessRequests(updatedRequests);
    saveAccessRequests(updatedRequests);

    // Grant session access to the user
    const request = accessRequests.find(req => req.id === requestId);
    if (request) {
      const updatedSessions = { ...userSessions };
      if (!updatedSessions[request.userId]) {
        updatedSessions[request.userId] = [];
      }
      if (!updatedSessions[request.userId].includes(request.resource)) {
        updatedSessions[request.userId].push(request.resource);
      }
      setUserSessions(updatedSessions);
      saveUserSessions(updatedSessions);
    }
  };

  const denyAccessRequest = async (requestId: string): Promise<void> => {
    if (!user || (user.role !== "Master Admin" && user.role !== "IT Head")) {
      throw new Error("Only Master Admin or IT Head can deny access requests");
    }

    const updatedRequests = accessRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'denied' as const,
          approvedBy: user.employeeId,
          approvedDate: new Date().toISOString()
        };
      }
      return req;
    });

    setAccessRequests(updatedRequests);
    saveAccessRequests(updatedRequests);
  };

  const hasAccess = (resource: string): boolean => {
    if (!user) return false;

    // Master Admin and IT Head always have access
    if (user.role === "Master Admin" || user.role === "IT Head") {
      return true;
    }

    // Check if user has session access to the resource
    return userSessions[user.id]?.includes(resource) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        createUser,
        getAllUsers,
        getUsers,
        updateUser,
        deleteUser,
        isLoading,
        requestAccess,
        getAccessRequests,
        approveAccessRequest,
        denyAccessRequest,
        hasAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
