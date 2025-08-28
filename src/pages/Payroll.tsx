import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePayroll } from "../contexts/PayrollContext";
import { useLeave } from "../contexts/LeaveContext";
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Download,
  FileText,
  Clock,
  Edit,
  Save,
  X,
  Plus,
  Filter,
  Search,
  CheckCircle,
  Check,
  Trash2,
  Calculator,
  History,
  Eye,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

const Payroll: React.FC = () => {
  const { user, getAllUsers } = useAuth();
  const { leaveRequests } = useLeave();
  const {
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
  } = usePayroll();

  // Get employees from auth context
  const employees = getAllUsers();

  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [activeTab, setActiveTab] = useState<
    "records" | "generate" | "time-tracking" | "edit-logs"
  >("records");
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editReason, setEditReason] = useState("");
  const [showTimeEntry, setShowTimeEntry] = useState(false);
  const [selectedEmployeeForTimeEntry, setSelectedEmployeeForTimeEntry] =
    useState("");
  const [selectedDateForTimeEntry, setSelectedDateForTimeEntry] = useState("");
  const [timeEntryForm, setTimeEntryForm] = useState({
    employeeId: "",
    date: "",
    hours: 0,
  });

  const isAdmin =
    user?.role === "Master Admin" ||
    user?.role === "President/CEO" ||
    user?.role === "Vice President" ||
    user?.role === "IT Head" ||
    user?.role === "HR";

  // Role-specific payroll access
  const getUserPayrollRecords = () => {
    if (isAdmin) {
      // Admins can see all records
      return payrollRecords;
    } else if (user?.role === "Employee" || user?.role === "Intern") {
      // Regular employees can only see their own records
      return getPayrollHistory(user?.employeeId || "");
    } else {
      // Other roles get empty array (additional security)
      return [];
    }
  };

  const userPayrollRecords = getUserPayrollRecords();

  const filteredRecords = userPayrollRecords.filter(
    (record) =>
      selectedPeriod === "all" || record.period.includes(selectedPeriod)
  );

  const totalNetPay = filteredRecords.reduce(
    (sum, record) => sum + record.netPay,
    0
  );
  const totalGrossPay = filteredRecords.reduce(
    (sum, record) => sum + record.grossPay,
    0
  );
  const totalDeductions = filteredRecords.reduce(
    (sum, record) => sum + record.deductions.totalDeductions,
    0
  );

  const upcomingPayPeriods = getUpcomingPayPeriods();

  // Cleanup old records on mount
  useEffect(() => {
    cleanupOldRecords();
  }, []);

  // Effect to set default time entry for selected employee
  useEffect(() => {
    if (isAdmin && showTimeEntry && selectedEmployeeForTimeEntry) {
      const today = new Date();
      const formattedToday = today.toISOString().split("T")[0];
      const targetDate = selectedDateForTimeEntry || formattedToday;

      // Check if employee is on approved leave for the target date
      const isOnLeave = leaveRequests.some(
        (request) =>
          request.employeeId === selectedEmployeeForTimeEntry &&
          request.status === "Approved" &&
          request.startDate <= targetDate &&
          request.endDate >= targetDate
      );

      setTimeEntryForm((prevState) => ({
        ...prevState,
        employeeId: selectedEmployeeForTimeEntry,
        date: targetDate,
        hours: isOnLeave ? 0 : 8, // Default to 8 hours unless on leave
      }));
    }
  }, [
    selectedEmployeeForTimeEntry,
    showTimeEntry,
    selectedDateForTimeEntry,
    isAdmin,
    employees,
    leaveRequests,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "status-active";
      case "Processed":
        return "status-pending";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleGeneratePayroll = async (period: string, payDate: string) => {
    try {
      // Filter employees based on current user's role and permissions
      let eligibleEmployees = employees;

      if (user?.role === "Admin") {
        // Admin can only generate for their department or limited scope
        eligibleEmployees = employees.filter(
          (emp) =>
            emp.department === user.department ||
            ["Employee", "Intern"].includes(emp.role)
        );
      } else if (user?.role === "HR") {
        // HR can generate for all employees except executives
        eligibleEmployees = employees.filter(
          (emp) =>
            !["Master Admin", "President/CEO", "Vice President"].includes(
              emp.role
            )
        );
      }
      // Master Admin, President/CEO, Vice President, IT Head can generate for all

      const employeeIds = eligibleEmployees.map((emp) => emp.employeeId);
      await generatePayroll(employeeIds, period, payDate);
      alert(
        `Payroll generated successfully for ${employeeIds.length} employees!`
      );
    } catch (error) {
      alert(`Error generating payroll: ${(error as Error).message}`);
    }
  };

  const handleEditRecord = (record: any) => {
    setEditingRecord(record.id);
    setEditForm({
      basicPay: record.basicPay,
      overtime: record.overtime,
      allowances: record.allowances,
      commissions: record.commissions,
      incentives: record.incentives,
      "deductions.loans": record.deductions.loans,
    });
    setEditReason("");
  };

  const handleSaveEdit = async () => {
    if (!editingRecord || !editReason.trim()) {
      alert("Please provide a reason for the edit");
      return;
    }

    try {
      const grossPay =
        editForm.basicPay +
        editForm.overtime +
        editForm.allowances +
        editForm.commissions +
        editForm.incentives;
      const record = payrollRecords.find((r) => r.id === editingRecord);
      if (!record) return;

      const netPay =
        grossPay -
        (record.deductions.sss +
          record.deductions.philHealth +
          record.deductions.pagIbig +
          record.deductions.tax +
          editForm["deductions.loans"]);

      const updates = {
        ...editForm,
        grossPay,
        netPay,
        deductions: {
          ...record.deductions,
          loans: editForm["deductions.loans"],
          totalDeductions:
            record.deductions.sss +
            record.deductions.philHealth +
            record.deductions.pagIbig +
            record.deductions.tax +
            editForm["deductions.loans"],
        },
      };

      await editPayrollRecord(editingRecord, updates, editReason);
      setEditingRecord(null);
      setEditForm({});
      setEditReason("");
      alert("Payroll record updated successfully!");
    } catch (error) {
      alert(`Error updating record: ${(error as Error).message}`);
    }
  };

  const handleLogTime = () => {
    if (
      !timeEntryForm.employeeId ||
      !timeEntryForm.date ||
      timeEntryForm.hours < 0
    ) {
      alert("Please fill all fields with valid data");
      return;
    }

    try {
      logTimeRecord(
        timeEntryForm.employeeId,
        timeEntryForm.date,
        timeEntryForm.hours
      );
      setTimeEntryForm({ employeeId: "", date: "", hours: 0 });
      setShowTimeEntry(false);
      setSelectedEmployeeForTimeEntry(""); // Reset selection
      setSelectedDateForTimeEntry("");
      alert("Time record logged successfully!");
    } catch (error) {
      alert(`Error logging time: ${(error as Error).message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payroll Management
          </h1>
          <p className="text-gray-600">
            Semi-monthly payroll system (15th & 30th) • Minimum wage:
            ₱86.88/hour
          </p>
          <div className="flex items-center mt-2 text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">
              Attendance data automatically synced with payroll time tracking
            </span>
          </div>
          <div className="flex items-center mt-1 text-amber-600">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span className="text-sm">
              Only 3 months of payroll data is retained. Older records are
              automatically deleted.
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setShowTimeEntry(true);
                setSelectedEmployeeForTimeEntry(""); // Reset selection when opening modal
                setSelectedDateForTimeEntry("");
              }}
              className="btn-secondary flex items-center"
            >
              <Clock className="w-4 h-4 mr-2" />
              Log Time
            </button>
            <button
              onClick={() => setActiveTab("generate")}
              className="btn-primary flex items-center"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Generate Payroll
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Net Pay</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{totalNetPay.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Gross Pay</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{totalGrossPay.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Deductions</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{totalDeductions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Payroll Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredRecords.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: "records", name: "Payroll Records", icon: FileText },
              ...(isAdmin
                ? [
                    {
                      id: "generate",
                      name: "Generate Payroll",
                      icon: Calculator,
                    },
                    { id: "time-tracking", name: "Time Tracking", icon: Clock },
                    { id: "edit-logs", name: "Edit Logs", icon: History },
                  ]
                : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="card-body">
          {/* Payroll Records Tab */}
          {activeTab === "records" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isAdmin ? "All Payroll Records" : "My Payroll Records"}
                </h2>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="form-input"
                  >
                    <option value="all">All Periods</option>
                    <option value="January 2025">January 2025</option>
                    <option value="December 2024">December 2024</option>
                    <option value="November 2024">November 2024</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {record.employeeName}
                          </h3>
                          <span className="text-sm text-gray-600">
                            ({record.employeeId})
                          </span>
                          <span
                            className={`${getStatusColor(
                              record.status
                            )} text-xs`}
                          >
                            {record.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {record.period} • Pay Date:{" "}
                          {new Date(record.payDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Hours Worked: {record.hoursWorked} @ ₱
                          {record.hourlyRate}/hr
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEditRecord(record)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setActiveTab("edit-logs")}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadPayslip(record.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingRecord === record.id ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-yellow-800 mb-3">
                          Edit Payroll Record
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Basic Pay
                            </label>
                            <input
                              type="number"
                              value={editForm.basicPay || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  basicPay: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="form-input mt-1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Overtime
                            </label>
                            <input
                              type="number"
                              value={editForm.overtime || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  overtime: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="form-input mt-1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Allowances
                            </label>
                            <input
                              type="number"
                              value={editForm.allowances || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  allowances: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="form-input mt-1"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Reason for Edit
                          </label>
                          <input
                            type="text"
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            placeholder="Required: Explain why you're making this change"
                            className="form-input mt-1 w-full"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="btn-primary text-sm"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingRecord(null)}
                            className="btn-secondary text-sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Earnings */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-3">
                          Earnings
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Basic Pay:</span>
                            <span className="font-medium">
                              ₱{record.basicPay.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Overtime:</span>
                            <span className="font-medium">
                              ₱{record.overtime.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Allowances:</span>
                            <span className="font-medium">
                              ₱{record.allowances.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Commissions:</span>
                            <span className="font-medium">
                              ₱{record.commissions.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Incentives:</span>
                            <span className="font-medium">
                              ₱{record.incentives.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-green-200 pt-2 font-semibold">
                            <span>Gross Pay:</span>
                            <span>₱{record.grossPay.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-3">
                          Deductions
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">SSS (4.5%):</span>
                            <span className="font-medium">
                              ₱{record.deductions.sss.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              PhilHealth (5%):
                            </span>
                            <span className="font-medium">
                              ₱{record.deductions.philHealth.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Pag-IBIG (1%):
                            </span>
                            <span className="font-medium">
                              ₱{record.deductions.pagIbig.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span className="font-medium">
                              ₱{record.deductions.tax.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Loans:</span>
                            <span className="font-medium">
                              ₱{record.deductions.loans.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-red-200 pt-2 font-semibold">
                            <span>Total Deductions:</span>
                            <span>
                              ₱
                              {record.deductions.totalDeductions.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Net Pay */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-3">
                          Net Pay
                        </h4>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-blue-900 mb-2">
                            ₱{record.netPay.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Take Home Pay</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <button
                            onClick={() => downloadPayslip(record.id)}
                            className="w-full btn-primary text-sm flex items-center justify-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Payslip
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No payroll records found
                  </h3>
                  <p className="text-gray-600">
                    No records match your current filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Generate Payroll Tab */}
          {activeTab === "generate" && isAdmin && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Generate Semi-Monthly Payroll
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-2">
                  Upcoming Pay Periods
                </h3>
                <p className="text-sm text-blue-700">
                  Select a pay period to generate payroll for all employees
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {upcomingPayPeriods.map((period, index) => {
                  const [startDate, endDate] = period.period.split(" - ");
                  const startFormatted = new Date(
                    startDate
                  ).toLocaleDateString();
                  const endFormatted = new Date(endDate).toLocaleDateString();
                  const displayPeriod = `${startFormatted} - ${endFormatted}`;

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {displayPeriod}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Pay Date:{" "}
                            {new Date(period.payDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleGeneratePayroll(period.period, period.payDate)
                          }
                          className="btn-primary text-sm"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Tracking Tab */}
          {activeTab === "time-tracking" && isAdmin && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Time Tracking
                  </h2>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Automatically synced with Attendance system
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTimeEntry(true);
                    setSelectedEmployeeForTimeEntry(""); // Reset selection
                    setSelectedDateForTimeEntry("");
                  }}
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Time Entry
                </button>
              </div>

              {/* Employee List for Master Admin */}
              {isAdmin && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">
                    Select Employee for Daily Time Entry
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Employee</label>
                      <select
                        value={selectedEmployeeForTimeEntry}
                        onChange={(e) => {
                          setSelectedEmployeeForTimeEntry(e.target.value);
                          // Reset hours if employee changes
                          if (e.target.value) {
                            setTimeEntryForm((prevState) => ({
                              ...prevState,
                              hours: 0,
                            }));
                          }
                        }}
                        className="form-input"
                      >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.employeeId} value={emp.employeeId}>
                            {emp.name} ({emp.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        value={selectedDateForTimeEntry}
                        onChange={(e) =>
                          setSelectedDateForTimeEntry(e.target.value)
                        }
                        className="form-input"
                      />
                    </div>
                    <div className="flex items-end">
                      {selectedEmployeeForTimeEntry && (
                        <button
                          onClick={() => {
                            // This button can be used to quickly log 8 hours if needed,
                            // but the default setting in the useEffect should handle it.
                            // We can also use this to trigger the time entry modal with pre-filled data.
                            if (
                              selectedEmployeeForTimeEntry &&
                              selectedDateForTimeEntry
                            ) {
                              setShowTimeEntry(true);
                            } else {
                              alert("Please select an employee and a date.");
                            }
                          }}
                          className="btn-secondary flex items-center"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Log Daily Hours
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {timeRecords.slice(-20).map((record, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{record.employeeId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {record.hoursWorked} hours
                        </p>
                        <p className="text-sm text-gray-600">
                          ₱{(record.hoursWorked * 86.88).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Logs Tab */}
          {activeTab === "edit-logs" && isAdmin && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Payroll Edit Audit Log
              </h2>

              <div className="space-y-4">
                {payrollEditLogs.slice(-50).map((log) => (
                  <div
                    key={log.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          Field: {log.fieldChanged}
                        </p>
                        <p className="text-sm text-gray-600">
                          Changed from:{" "}
                          <span className="font-mono bg-red-100 px-1 rounded">
                            {JSON.stringify(log.oldValue)}
                          </span>
                          {" → "}
                          <span className="font-mono bg-green-100 px-1 rounded">
                            {JSON.stringify(log.newValue)}
                          </span>
                        </p>
                        {log.reason && (
                          <p className="text-sm text-gray-600 mt-1">
                            Reason: {log.reason}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>By: {log.editedBy}</p>
                        <p>{new Date(log.editedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {payrollEditLogs.length === 0 && (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No edit logs found
                  </h3>
                  <p className="text-gray-600">
                    All payroll edits will be automatically logged here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Time Entry Modal */}
      {showTimeEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Log Time Entry</h3>

            <div className="space-y-4">
              <div>
                <label className="form-label">Employee</label>
                <select
                  value={timeEntryForm.employeeId}
                  onChange={(e) =>
                    setTimeEntryForm({
                      ...timeEntryForm,
                      employeeId: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="e.g., EMP001"
                  disabled={
                    !!selectedEmployeeForTimeEntry &&
                    activeTab === "time-tracking"
                  } // Keep selected employee if already chosen from list
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={timeEntryForm.date}
                  onChange={(e) =>
                    setTimeEntryForm({ ...timeEntryForm, date: e.target.value })
                  }
                  className="form-input"
                  disabled={
                    !!selectedDateForTimeEntry && activeTab === "time-tracking"
                  } // Keep selected date if already chosen from list
                />
              </div>

              <div>
                <label className="form-label">Hours Worked</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={timeEntryForm.hours}
                  onChange={(e) =>
                    setTimeEntryForm({
                      ...timeEntryForm,
                      hours: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowTimeEntry(false);
                  setSelectedEmployeeForTimeEntry(""); // Reset selection
                  setSelectedDateForTimeEntry("");
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleLogTime} className="btn-primary">
                Log Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
