import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAttendance } from "../contexts/AttendanceContext";
import {
  Clock,
  Calendar,
  Users,
  LogIn,
  LogOut,
  Filter,
  Search,
  Edit,
  Plus,
  Save,
  X,
  Trash2,
  AlertCircle,
  CheckCircle,
  Eye,
  TrendingUp,
} from "lucide-react";

const Attendance: React.FC = () => {
  const { user, getAllUsers, getUsers } = useAuth();
  const {
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
  } = useAttendance();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [manualEntryForm, setManualEntryForm] = useState({
    employeeId: "",
    date: "",
    timeIn: "",
    timeOut: "",
    remarks: "",
  });
  const [editForm, setEditForm] = useState({
    timeIn: "",
    timeOut: "",
    remarks: "",
  });

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

  const employees = isAdmin ? getUsers() : [];
  const todaysAttendance = user
    ? getTodaysAttendance(user.employeeId)
    : undefined;

  // Get records based on user role
  const getDisplayRecords = () => {
    if (isAdmin) {
      let records = selectedDate
        ? getAllAttendanceForDate(selectedDate)
        : attendanceRecords;

      if (selectedEmployee) {
        records = records.filter(
          (record) => record.employeeId === selectedEmployee
        );
      }

      if (statusFilter !== "all") {
        records = records.filter((record) => record.status === statusFilter);
      }

      return records.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else {
      // Employee view - only their own records
      return getEmployeeAttendance(user?.employeeId || "");
    }
  };

  const displayRecords = getDisplayRecords();
  const stats = getAttendanceStats(
    isAdmin ? selectedEmployee || undefined : user?.employeeId
  );

  const handleTimeIn = async () => {
    if (!user) return;
    try {
      await timeIn(user.employeeId);
      alert("Successfully timed in!");
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
  };

  const handleTimeOut = async () => {
    if (!user) return;
    try {
      await timeOut(user.employeeId);
      alert("Successfully timed out!");
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
  };

  const handleManualEntry = async () => {
    if (
      !manualEntryForm.employeeId ||
      !manualEntryForm.date ||
      !manualEntryForm.timeIn
    ) {
      alert("Please fill required fields");
      return;
    }

    try {
      await createManualAttendance(
        manualEntryForm.employeeId,
        manualEntryForm.date,
        manualEntryForm.timeIn,
        manualEntryForm.timeOut || undefined,
        manualEntryForm.remarks || undefined
      );
      setShowManualEntry(false);
      setManualEntryForm({
        employeeId: "",
        date: "",
        timeIn: "",
        timeOut: "",
        remarks: "",
      });
      alert("Manual attendance record created successfully!");
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
  };

  const handleEditRecord = (record: any) => {
    setEditingRecord(record.id);
    setEditForm({
      timeIn: record.timeIn || "",
      timeOut: record.timeOut || "",
      remarks: record.remarks || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    try {
      await editAttendanceRecord(editingRecord, editForm);
      setEditingRecord(null);
      setEditForm({ timeIn: "", timeOut: "", remarks: "" });
      alert("Attendance record updated successfully!");
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?"))
      return;

    try {
      await deleteAttendanceRecord(id);
      alert("Attendance record deleted successfully!");
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Late":
        return "bg-yellow-100 text-yellow-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Undertime":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "--:--";
    return timeStr;
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="text-gray-600">
            {isAdmin
              ? "Monitor and manage employee attendance"
              : "Track your daily attendance"}
          </p>
          <div className="flex items-center mt-2 text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">
              Attendance data automatically flows to Payroll Time Tracking
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleTimeIn}
            disabled={todaysAttendance?.timeIn ? true : false}
            className={`btn-primary flex items-center ${
              todaysAttendance?.timeIn ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Time In
          </button>
          <button
            onClick={handleTimeOut}
            disabled={
              !todaysAttendance?.timeIn || todaysAttendance?.timeOut
                ? true
                : false
            }
            className={`btn-secondary flex items-center ${
              !todaysAttendance?.timeIn || todaysAttendance?.timeOut
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Time Out
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowManualEntry(true)}
            className="btn-secondary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Manual Entry
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalDays}
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
              <p className="text-sm text-gray-600">Present Days</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.presentDays}
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
              <p className="text-sm text-gray-600">Late Days</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.lateDays}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatHours(stats.averageHours)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Status for All Users */}
      {todaysAttendance && (
        <div className="card mb-8">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">Today's Attendance</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Time In</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatTime(todaysAttendance.timeIn)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Time Out</p>
                <p className="text-xl font-semibold text-red-600">
                  {formatTime(todaysAttendance.timeOut)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-xl font-semibold text-blue-600">
                  {formatHours(todaysAttendance.totalHours)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    todaysAttendance.status
                  )}`}
                >
                  {todaysAttendance.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters for Admin */}
      {isAdmin && (
        <div className="card mb-8">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="all">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Undertime">Undertime</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">
            {isAdmin ? "Attendance Records" : "My Attendance History"}
          </h3>

          <div className="space-y-4">
            {displayRecords.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {record.employeeName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString()} •{" "}
                        {record.employeeId}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {editingRecord === record.id ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-yellow-800 mb-3">
                      Edit Attendance Record
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="form-label">Time In</label>
                        <input
                          type="time"
                          value={editForm.timeIn}
                          onChange={(e) =>
                            setEditForm({ ...editForm, timeIn: e.target.value })
                          }
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Time Out</label>
                        <input
                          type="time"
                          value={editForm.timeOut}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              timeOut: e.target.value,
                            })
                          }
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Remarks</label>
                        <input
                          type="text"
                          value={editForm.remarks}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              remarks: e.target.value,
                            })
                          }
                          className="form-input"
                          placeholder="Optional remarks"
                        />
                      </div>
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

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Time In</p>
                    <p className="font-semibold text-green-600">
                      {formatTime(record.timeIn)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Time Out</p>
                    <p className="font-semibold text-red-600">
                      {formatTime(record.timeOut)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="font-semibold text-blue-600">
                      {formatHours(record.totalHours)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Remarks</p>
                    <p className="text-sm text-gray-900">
                      {record.remarks || "--"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {displayRecords.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No attendance records found
              </h3>
              <p className="text-gray-600">
                {isAdmin
                  ? "No records match your current filters."
                  : "Start tracking your attendance by timing in."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Manual Attendance Entry
            </h3>

            <div className="space-y-4">
              <div>
                <label className="form-label">Employee</label>
                <select
                  value={manualEntryForm.employeeId}
                  onChange={(e) =>
                    setManualEntryForm({
                      ...manualEntryForm,
                      employeeId: e.target.value,
                    })
                  }
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
                  value={manualEntryForm.date}
                  onChange={(e) =>
                    setManualEntryForm({
                      ...manualEntryForm,
                      date: e.target.value,
                    })
                  }
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Time In</label>
                <input
                  type="time"
                  value={manualEntryForm.timeIn}
                  onChange={(e) =>
                    setManualEntryForm({
                      ...manualEntryForm,
                      timeIn: e.target.value,
                    })
                  }
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Time Out (Optional)</label>
                <input
                  type="time"
                  value={manualEntryForm.timeOut}
                  onChange={(e) =>
                    setManualEntryForm({
                      ...manualEntryForm,
                      timeOut: e.target.value,
                    })
                  }
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Remarks (Optional)</label>
                <input
                  type="text"
                  value={manualEntryForm.remarks}
                  onChange={(e) =>
                    setManualEntryForm({
                      ...manualEntryForm,
                      remarks: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="Any additional notes"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowManualEntry(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleManualEntry} className="btn-primary">
                Create Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
