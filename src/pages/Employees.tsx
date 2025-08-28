import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useEmployee } from "../contexts/EmployeeContext";
import {
  Users,
  Search,
  Filter,
  Eye,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  User,
  UserCheck,
  Shield,
  FileText,
  Download,
  Upload,
} from "lucide-react";

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  hireDate: string;
  status: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };
  employmentType: string;
}

const Employees: React.FC = () => {
  const { user: currentUser, hasAccess, requestAccess } = useAuth();
  const { employees, isLoading } = useEmployee();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);

  // Check if current user has edit permissions
  const hasEditPermissions =
    currentUser?.role === "Master Admin" ||
    currentUser?.role === "IT Head" ||
    currentUser?.role === "HR";

  // Check if current user can only view
  const isViewOnly =
    currentUser?.role === "President/CEO" ||
    currentUser?.role === "Vice President";

  // Check if HR user has access to employee directory
  const hasEmployeeAccess = hasAccess("employee_directory");

  const handleRequestAccess = async () => {
    setIsRequestingAccess(true);
    try {
      await requestAccess("employee_directory");
      alert(
        "Access request submitted successfully. You will be notified when approved."
      );
    } catch (error) {
      alert("Failed to submit access request. Please try again.");
    } finally {
      setIsRequestingAccess(false);
    }
  };

  // If HR user doesn't have access, show request access screen
  if (currentUser?.role === "HR" && !hasEmployeeAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <Shield className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Required
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You need permission to access the Employee Directory.
          </p>
          <div className="mt-6">
            <button
              onClick={handleRequestAccess}
              disabled={isRequestingAccess}
              className="btn-primary flex items-center mx-auto"
            >
              {isRequestingAccess ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Requesting Access...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Request Access
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const departments = [
    "Executive",
    "Human Resources",
    "Information Technology",
    "Sales",
    "Marketing",
    "Operations",
    "Finance",
    "Legal",
  ];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || employee.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Master Admin":
        return "bg-red-100 text-red-800";
      case "President/CEO":
        return "bg-purple-100 text-purple-800";
      case "Vice President":
        return "bg-indigo-100 text-indigo-800";
      case "IT Head":
        return "bg-blue-100 text-blue-800";
      case "HR":
        return "bg-green-100 text-green-800";
      case "Employee":
        return "bg-gray-100 text-gray-800";
      case "Intern":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Master Admin":
        return <Shield className="w-4 h-4" />;
      case "President/CEO":
        return <Shield className="w-4 h-4" />;
      case "Vice President":
        return <UserCheck className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Directory
          </h1>
          <p className="text-gray-600">
            {isViewOnly
              ? "View employee information"
              : "Manage employee records and information"}
          </p>
        </div>
        <div className="flex space-x-3">
          {currentUser?.role === "HR" && (
            <button className="btn-secondary flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Request
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter((e) => e.status === "Active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Building className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(employees.map((e) => e.department)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            Employee Records
          </h2>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Hire Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {employee.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {employee.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {getRoleIcon(employee.role)}
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                            employee.role
                          )}`}
                        >
                          {employee.role}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-1" />
                        {employee.department}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-1" />
                          {employee.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-1" />
                          {employee.phone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          employee.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(employee.hireDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowViewModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isViewOnly && (
                          <div className="text-sm text-gray-400 px-2 py-1">
                            View Only
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Employee Details
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedEmployee(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={selectedEmployee.name}
                    className="form-input"
                    readOnly
                  />
                </div>
                <div>
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    value={selectedEmployee.employeeId}
                    className="form-input"
                    readOnly
                  />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    value={selectedEmployee.role}
                    className="form-input"
                    readOnly
                  />
                </div>
                <div>
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    value={selectedEmployee.department}
                    className="form-input"
                    readOnly
                  />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={selectedEmployee.email}
                    className="form-input"
                    readOnly
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={selectedEmployee.phone}
                    className="form-input"
                    readOnly
                  />
                </div>
                <div>
                  <label className="form-label">Employment Type</label>
                  <input
                    type="text"
                    value={selectedEmployee.employmentType}
                    className="form-input"
                    readOnly
                  />
                </div>
                <div>
                  <label className="form-label">Hire Date</label>
                  <input
                    type="text"
                    value={new Date(
                      selectedEmployee.hireDate
                    ).toLocaleDateString()}
                    className="form-input"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Address</label>
                <textarea
                  value={selectedEmployee.address}
                  className="form-input"
                  rows={3}
                  readOnly
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Emergency Contact
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      value={selectedEmployee.emergencyContact.name}
                      className="form-input"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="form-label">Relationship</label>
                    <input
                      type="text"
                      value={selectedEmployee.emergencyContact.relationship}
                      className="form-input"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      value={selectedEmployee.emergencyContact.phone}
                      className="form-input"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Address</label>
                    <input
                      type="text"
                      value={selectedEmployee.emergencyContact.address}
                      className="form-input"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedEmployee(null);
                }}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
