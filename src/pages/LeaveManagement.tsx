import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLeave } from "../contexts/LeaveContext";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  FileText,
  User,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const {
    leaveRequests,
    leaveBalances,
    submitLeaveRequest,
    updateLeaveRequestStatus,
    getLeaveBalance,
    calculateEndDate,
    validateLeaveDuration,
    getStats,
  } = useLeave();
  const [activeTab, setActiveTab] = useState<"requests" | "balance" | "apply">(
    "requests"
  );
  const [statusFilter, setStatusFilter] = useState("all");

  // Form state for leave application
  const [leaveForm, setLeaveForm] = useState({
    type: "",
    days: 1,
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin =
    user?.role &&
    [
      "Master Admin",
      "President/CEO",
      "Vice President",
      "IT Head",
      "HR",
      "Admin",
    ].includes(user.role);

  const userLeaveRequests = isAdmin
    ? leaveRequests
    : leaveRequests.filter((req) => req.employeeId === user?.employeeId);

  const filteredRequests = userLeaveRequests.filter(
    (request) => statusFilter === "all" || request.status === statusFilter
  );

  const userBalance = getLeaveBalance(user?.employeeId || "");
  const stats = getStats();

  // Handle form input changes
  const handleFormChange = (field: string, value: string | number) => {
    const updatedForm = { ...leaveForm, [field]: value };

    // Auto-calculate end date when start date or days change
    if (
      (field === "startDate" || field === "days") &&
      updatedForm.startDate &&
      updatedForm.days > 0 &&
      updatedForm.type
    ) {
      updatedForm.endDate = calculateEndDate(
        updatedForm.startDate,
        Number(updatedForm.days),
        updatedForm.type
      );
    }

    // Set maximum days based on leave type
    if (field === "type") {
      if (["Vacation", "Sick", "Emergency"].includes(value as string)) {
        updatedForm.days = Math.min(updatedForm.days, 5);
      }
      if (updatedForm.startDate && updatedForm.days > 0) {
        updatedForm.endDate = calculateEndDate(
          updatedForm.startDate,
          Number(updatedForm.days),
          value as string
        );
      }
    }

    setLeaveForm(updatedForm);

    // Clear related errors
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!leaveForm.type) errors.type = "Leave type is required";
    if (!leaveForm.startDate) errors.startDate = "Start date is required";
    if (leaveForm.days < 1) errors.days = "Duration must be at least 1 day";
    if (!leaveForm.reason.trim()) errors.reason = "Reason is required";

    // Validate leave duration
    if (leaveForm.type && user?.employeeId) {
      const validation = validateLeaveDuration(
        leaveForm.type,
        leaveForm.days,
        user.employeeId
      );
      if (!validation.isValid) {
        errors.days = validation.message || "Invalid leave duration";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit leave application
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      await submitLeaveRequest({
        employeeId: user.employeeId,
        employeeName: user.name,
        type: leaveForm.type as any,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        days: leaveForm.days,
        reason: leaveForm.reason,
      });

      // Reset form
      setLeaveForm({
        type: "",
        days: 1,
        startDate: "",
        endDate: "",
        reason: "",
      });

      // Switch to requests tab
      setActiveTab("requests");

      alert("Leave request submitted successfully!");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status update for admin
  const handleStatusUpdate = async (
    requestId: string,
    newStatus: "Pending" | "Approved" | "Rejected"
  ) => {
    if (!user || !isAdmin) return;

    try {
      await updateLeaveRequestStatus(requestId, newStatus, user.employeeId);
      alert(`Leave request ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "status-active";
      case "Rejected":
        return "status-inactive";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Manage leave requests and balances</p>
        </div>
        <button
          onClick={() => setActiveTab("apply")}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Apply for Leave
        </button>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {isAdmin ? stats.total : userLeaveRequests.length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {isAdmin
                  ? stats.pending
                  : userLeaveRequests.filter((req) => req.status === "Pending")
                      .length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {isAdmin
                  ? stats.approved
                  : userLeaveRequests.filter((req) => req.status === "Approved")
                      .length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CalendarDays className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Available Leave</p>
              <p className="text-2xl font-bold text-gray-900">
                {userBalance
                  ? userBalance.vacation - userBalance.vacationUsed
                  : 0}
              </p>
              <p className="text-xs text-gray-500">Vacation days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: "requests", name: "Leave Requests", icon: FileText },
              { id: "balance", name: "Leave Balance", icon: Calendar },
              { id: "apply", name: "Apply for Leave", icon: Plus },
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
          {/* Leave Requests Tab */}
          {activeTab === "requests" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isAdmin ? "All Leave Requests" : "My Leave Requests"}
                </h2>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-input"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {request.type} Leave
                          </h3>
                          <span
                            className={`${getStatusColor(
                              request.status
                            )} text-xs`}
                          >
                            {request.status}
                          </span>
                        </div>

                        {isAdmin && (
                          <p className="text-sm text-gray-600 mb-2">
                            <User className="w-4 h-4 inline mr-1" />
                            {request.employeeName} ({request.employeeId})
                          </p>
                        )}

                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Start Date:</strong>{" "}
                              {new Date(request.startDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>End Date:</strong>{" "}
                              {new Date(request.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Duration:</strong> {request.days} day(s)
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Applied:</strong>{" "}
                              {new Date(
                                request.appliedDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Reason:</strong> {request.reason}
                        </p>

                        {request.approvedBy && (
                          <p className="text-xs text-gray-500">
                            {request.status} by {request.approvedBy} on{" "}
                            {request.approvedDate &&
                              new Date(
                                request.approvedDate
                              ).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusIcon(request.status)}
                        {isAdmin && (
                          <div className="flex space-x-2">
                            <select
                              value={request.status}
                              onChange={(e) =>
                                handleStatusUpdate(
                                  request.id,
                                  e.target.value as any
                                )
                              }
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No leave requests found
                  </h3>
                  <p className="text-gray-600">
                    No requests match your current filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Leave Balance Tab */}
          {activeTab === "balance" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Leave Balance
              </h2>

              {userBalance && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      type: "Vacation",
                      total: userBalance.vacation,
                      used: userBalance.vacationUsed,
                      remaining:
                        userBalance.vacation - userBalance.vacationUsed,
                      color: "blue",
                      maxDays: "5 consecutive days per year",
                    },
                    {
                      type: "Sick",
                      total: userBalance.sick,
                      used: userBalance.sickUsed,
                      remaining: userBalance.sick - userBalance.sickUsed,
                      color: "green",
                      maxDays: "5 consecutive days per year",
                    },
                    {
                      type: "Emergency",
                      total: userBalance.emergency,
                      used: userBalance.emergencyUsed,
                      remaining:
                        userBalance.emergency - userBalance.emergencyUsed,
                      color: "red",
                      maxDays: "5 consecutive days per year",
                    },
                    {
                      type: "Maternity",
                      total: userBalance.maternity,
                      used: userBalance.maternityUsed,
                      remaining:
                        userBalance.maternity - userBalance.maternityUsed,
                      color: "purple",
                      maxDays: "105 days (+ 15 days extension)",
                    },
                  ].map((leave) => (
                    <div key={leave.type} className="card">
                      <div className="card-body text-center">
                        <div
                          className={`w-16 h-16 bg-${leave.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
                        >
                          <Calendar
                            className={`w-8 h-8 text-${leave.color}-600`}
                          />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {leave.type} Leave
                        </h3>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                          {leave.remaining}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          days remaining
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>
                            Used: {leave.used}/{leave.total}
                          </p>
                          <p className="mt-1">{leave.maxDays}</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div
                            className={`bg-${leave.color}-600 h-2 rounded-full`}
                            style={{
                              width: `${
                                leave.total > 0
                                  ? (leave.used / leave.total) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Apply for Leave Tab */}
          {activeTab === "apply" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Apply for Leave
              </h2>

              <form onSubmit={handleSubmitLeave} className="max-w-2xl">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Leave Type *</label>
                    <select
                      className={`form-input ${
                        formErrors.type ? "border-red-500" : ""
                      }`}
                      value={leaveForm.type}
                      onChange={(e) => handleFormChange("type", e.target.value)}
                    >
                      <option value="">Select leave type</option>
                      <option value="Vacation">Vacation Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Emergency">Emergency Leave</option>
                      {userBalance && userBalance.maternity > 0 && (
                        <option value="Maternity">Maternity Leave</option>
                      )}
                    </select>
                    {formErrors.type && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.type}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Duration (Days) *</label>
                    <input
                      type="number"
                      className={`form-input ${
                        formErrors.days ? "border-red-500" : ""
                      }`}
                      placeholder="Number of days"
                      min="1"
                      max={leaveForm.type === "Maternity" ? 120 : 5}
                      value={leaveForm.days}
                      onChange={(e) =>
                        handleFormChange("days", parseInt(e.target.value) || 1)
                      }
                    />
                    {formErrors.days && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.days}
                      </p>
                    )}
                    {leaveForm.type && (
                      <p className="text-sm text-gray-600 mt-1">
                        {leaveForm.type === "Maternity"
                          ? "Max: 105 days (+ 15 days extension)"
                          : "Max: 5 consecutive days per year"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      className={`form-input ${
                        formErrors.startDate ? "border-red-500" : ""
                      }`}
                      value={leaveForm.startDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleFormChange("startDate", e.target.value)
                      }
                    />
                    {formErrors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input bg-gray-100"
                      value={leaveForm.endDate}
                      readOnly
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Automatically calculated
                    </p>
                  </div>
                </div>

                {/* Leave Balance Warning */}
                {leaveForm.type && userBalance && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">
                          Current Balance
                        </h4>
                        <p className="text-sm text-blue-700">
                          {leaveForm.type} Leave:{" "}
                          {leaveForm.type === "Vacation"
                            ? userBalance.vacation - userBalance.vacationUsed
                            : leaveForm.type === "Sick"
                            ? userBalance.sick - userBalance.sickUsed
                            : leaveForm.type === "Emergency"
                            ? userBalance.emergency - userBalance.emergencyUsed
                            : leaveForm.type === "Maternity"
                            ? userBalance.maternity - userBalance.maternityUsed
                            : 0}{" "}
                          days available
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <label className="form-label">Reason *</label>
                  <textarea
                    className={`form-input ${
                      formErrors.reason ? "border-red-500" : ""
                    }`}
                    rows={4}
                    placeholder="Please provide a reason for your leave request..."
                    value={leaveForm.reason}
                    onChange={(e) => handleFormChange("reason", e.target.value)}
                  ></textarea>
                  {formErrors.reason && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.reason}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <label className="form-label">
                    Supporting Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex space-x-4">
                  <button
                    type="submit"
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setLeaveForm({
                        type: "",
                        days: 1,
                        startDate: "",
                        endDate: "",
                        reason: "",
                      });
                      setFormErrors({});
                    }}
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
