import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEmployee } from "../contexts/EmployeeContext";
import { useAttendance } from "../contexts/AttendanceContext";
import { useLeave } from "../contexts/LeaveContext";
import { usePerformance } from "../contexts/PerformanceContext";
import { usePayroll } from "../contexts/PayrollContext";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Award,
  UserPlus,
  ArrowRight,
  Activity,
  Bell,
  Shield,
  X,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, getAccessRequests, approveAccessRequest, denyAccessRequest } =
    useAuth();
  const { employees } = useEmployee();
  const { timeRecords } = useAttendance();
  const { leaveRequests } = useLeave();
  const { ratings } = usePerformance();
  const { payrollRecords } = usePayroll();
  const [showAccessRequests, setShowAccessRequests] = useState(false);

  // Get pending access requests for admins
  const accessRequests = getAccessRequests().filter(
    (req) => req.status === "pending"
  );

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveAccessRequest(requestId);
      alert("Access request approved successfully.");
    } catch (error) {
      alert("Failed to approve access request.");
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    try {
      await denyAccessRequest(requestId);
      alert("Access request denied.");
    } catch (error) {
      alert("Failed to deny access request.");
    }
  };

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

  const quickActions = [
    { title: "Apply for Leave", href: "/leave", icon: Calendar, color: "blue" },
    {
      title: "View Payslip",
      href: "/payroll",
      icon: DollarSign,
      color: "green",
    },
    { title: "Update Profile", href: "/profile", icon: Users, color: "purple" },
    {
      title: "Performance Review",
      href: "/performance",
      icon: Award,
      color: "yellow",
    },
  ];

  const adminActions = [
    {
      title: "User Management",
      href: "/user-management",
      icon: Users,
      color: "red",
    },
    {
      title: "Manage Employees",
      href: "/employees",
      icon: Users,
      color: "blue",
    },
    {
      title: "Process Payroll",
      href: "/payroll",
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Review Applications",
      href: "/leave",
      icon: Calendar,
      color: "purple",
    },
    { title: "View Reports", href: "/reports", icon: FileText, color: "red" },
  ];

  const recentActivities = [
    {
      type: "leave",
      message: "Leave application approved",
      time: "2 hours ago",
      status: "success",
    },
    {
      type: "payroll",
      message: "Payslip generated for December 2024",
      time: "1 day ago",
      status: "info",
    },
    {
      type: "performance",
      message: "Performance review scheduled",
      time: "3 days ago",
      status: "warning",
    },
    {
      type: "training",
      message: "Training module completed",
      time: "1 week ago",
      status: "success",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 18
            ? "afternoon"
            : "evening"}
          , {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role} •{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
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
              <p className="text-2xl font-bold text-gray-900">247</p>
              <p className="text-xs text-green-600">+5 this month</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Leave Requests</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-yellow-600">3 pending approval</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Payroll</p>
              <p className="text-2xl font-bold text-gray-900">₱2.4M</p>
              <p className="text-xs text-blue-600">December 2024</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
              <p className="text-xs text-green-600">Above target</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isAdmin ? "Admin Actions" : "Quick Actions"}
                </h2>
                {(user?.role === "Master Admin" || user?.role === "IT Head") &&
                  accessRequests.length > 0 && (
                    <button
                      onClick={() => setShowAccessRequests(true)}
                      className="flex items-center text-sm text-red-600 hover:text-red-800"
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      {accessRequests.length} Access Request
                      {accessRequests.length > 1 ? "s" : ""}
                    </button>
                  )}
              </div>
            </div>
            <div className="card-body">
              <div className="grid md:grid-cols-2 gap-4">
                {(isAdmin ? adminActions : quickActions).map(
                  (action, index) => (
                    <Link
                      key={index}
                      to={action.href}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
                    >
                      <div className="flex items-center">
                        <div
                          className={`p-2 bg-${action.color}-100 rounded-lg group-hover:bg-${action.color}-200 transition-colors`}
                        >
                          <action.icon
                            className={`w-5 h-5 text-${action.color}-600`}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">
                            {action.title}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="card mt-8">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Activities
              </h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Access Requests Modal */}
          {showAccessRequests && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Access Requests
                  </h2>
                  <button
                    onClick={() => setShowAccessRequests(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {accessRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No pending access requests
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {accessRequests.map((request) => (
                        <div
                          key={request.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center">
                                <Shield className="w-5 h-5 text-yellow-600 mr-2" />
                                <h3 className="font-medium text-gray-900">
                                  {request.userName}
                                </h3>
                                <span className="ml-2 text-sm text-gray-500">
                                  ({request.userRole})
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Requesting access to:{" "}
                                <span className="font-medium">
                                  Employee Directory
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Requested on{" "}
                                {new Date(
                                  request.requestDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDenyRequest(request.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                              >
                                Deny
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center space-x-4">
                {/* Profile Image */}
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {(() => {
                    if (!user) {
                      return (
                        <span className="text-white font-bold text-xl">?</span>
                      );
                    }

                    const profileImage = localStorage.getItem(
                      `profile_image_${user.id}`
                    );
                    return profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "?"}
                      </span>
                    );
                  })()}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.role}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Employee ID: {user?.employeeId}
                  </p>
                </div>
              </div>

              {/* View Profile Button */}
              <Link
                to="/profile"
                className="mt-4 inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                View Profile
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Team Meeting</p>
                    <p className="text-gray-600">Tomorrow, 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center p-2 bg-green-50 rounded-lg">
                  <Award className="w-4 h-4 text-green-600 mr-2" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      Performance Review
                    </p>
                    <p className="text-gray-600">Dec 28, 2024</p>
                  </div>
                </div>
                <div className="flex items-center p-2 bg-purple-50 rounded-lg">
                  <UserPlus className="w-4 h-4 text-purple-600 mr-2" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      New Hire Orientation
                    </p>
                    <p className="text-gray-600">Jan 2, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Your Stats</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Leave Balance</span>
                  <span className="font-medium text-gray-900">15 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className="font-medium text-green-600">98%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Performance Score
                  </span>
                  <span className="font-medium text-blue-600">4.8/5.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Training Hours</span>
                  <span className="font-medium text-purple-600">24 hrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
