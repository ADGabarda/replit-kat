import React, { createContext, useContext, useState } from "react";

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  birthdate: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };
  employmentType: "Regular" | "Probationary" | "Contractual" | "Part-time";
  status: "Active" | "Inactive" | "On Leave";
  hireDate: string;
  salary: number;
  documents: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    url: string;
  }[];
}

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
};

const EMPLOYEES_STORAGE_KEY = "afflatus_employees";

const loadEmployees = (): Employee[] => {
  const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // Default employees if none exist
  const defaultEmployees = [
    {
      id: "1",
      employeeId: "EMP001",
      name: "Juan Carlos Dela Cruz",
      role: "President/CEO",
      department: "Executive",
      email: "juan.delacruz@afflatus.com",
      phone: "+63 917 123 4567",
      address: "123 Makati Ave, Makati City, Metro Manila",
      birthdate: "1980-05-15",
      emergencyContact: {
        name: "Maria Dela Cruz",
        relationship: "Spouse",
        phone: "+63 917 765 4321",
        address: "123 Makati Ave, Makati City, Metro Manila",
      },
      employmentType: "Regular",
      status: "Active",
      hireDate: "2020-01-15",
      salary: 150000,
      documents: [],
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
      birthdate: "1985-08-22",
      emergencyContact: {
        name: "Jose Rodriguez",
        relationship: "Spouse",
        phone: "+63 917 876 5432",
        address: "456 BGC Blvd, Taguig City, Metro Manila",
      },
      employmentType: "Regular",
      status: "Active",
      hireDate: "2020-03-01",
      salary: 80000,
      documents: [],
    },
  ];

  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(defaultEmployees));
  return defaultEmployees;
};

const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
};

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees());

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString(),
      // Generate employeeId if not provided
      employeeId:
        employee.employeeId ||
        `EMP${Date.now().toString().slice(-3).padStart(3, "0")}`,
    };
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    saveEmployees(updatedEmployees);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === id ? { ...emp, ...updates } : emp
    );
    setEmployees(updatedEmployees);
    saveEmployees(updatedEmployees);
  };

  const deleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter((emp) => emp.id !== id);
    setEmployees(updatedEmployees);
    saveEmployees(updatedEmployees);
  };

  const getEmployee = (id: string) => {
    return employees.find((emp) => emp.id === id);
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
