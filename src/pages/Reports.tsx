import React, { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Filter,
  FileText,
  Eye,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useEmployee } from "../contexts/EmployeeContext";
import { useAttendance } from "../contexts/AttendanceContext";
import { usePayroll } from "../contexts/PayrollContext";
import { usePerformance } from "../contexts/PerformanceContext";
import { useLeave } from "../contexts/LeaveContext";
import { useGoals } from "../contexts/GoalsContext";

const Reports: React.FC = () => {
  const { user, getAllUsers } = useAuth();
  const { employees } = useEmployee();
  const { attendanceRecords, getAttendanceStats } = useAttendance();
  const { payrollRecords } = usePayroll();
  const { ratings, getTopPerformers, getRatingDistribution } = usePerformance();
  const { leaveRequests } = useLeave();
  const { goals } = useGoals();

  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState("last-month");
  const [department, setDepartment] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Custom date range states
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const reportTypes = [
    {
      id: "overview",
      name: "Executive Dashboard",
      icon: BarChart3,
      description: "High-level organizational metrics",
    },
    {
      id: "attendance",
      name: "Attendance Analytics",
      icon: Clock,
      description: "Comprehensive attendance insights",
    },
    {
      id: "payroll",
      name: "Payroll Intelligence",
      icon: DollarSign,
      description: "Financial and compensation analysis",
    },
    {
      id: "performance",
      name: "Performance Analytics",
      icon: Award,
      description: "Employee performance trends",
    },
    {
      id: "leave",
      name: "Leave Management",
      icon: Calendar,
      description: "Leave patterns and utilization",
    },
    {
      id: "workforce",
      name: "Workforce Insights",
      icon: Users,
      description: "Employee demographics and trends",
    },
    {
      id: "goals",
      name: "Goals & KPI Tracking",
      icon: Target,
      description: "Organizational goal achievement",
    },
  ];

  const departments = [
    "all",
    "Executive",
    "Human Resources",
    "Sales",
    "Marketing",
    "Operations",
    "IT",
    "Finance",
    "Support",
  ];

  // Utility functions for date filtering
  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (dateRange) {
      case "last-week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "last-month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "last-quarter":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "last-year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case "custom":
        startDate = customStartDate
          ? new Date(customStartDate)
          : new Date(today.getFullYear(), 0, 1);
        endDate = customEndDate ? new Date(customEndDate) : today;
        break;
      default:
        startDate.setMonth(today.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Filter data based on department and date range
  const getFilteredEmployees = () => {
    if (department === "all") return employees;
    return employees.filter((emp) => emp.department === department);
  };

  // Calculate comprehensive metrics
  const calculateMetrics = () => {
    const { startDate, endDate } = getDateRange();
    const filteredEmployees = getFilteredEmployees();
    const employeeIds = filteredEmployees.map((emp) => emp.employeeId);

    // Attendance metrics
    const filteredAttendance = attendanceRecords.filter(
      (record) =>
        employeeIds.includes(record.employeeId) &&
        record.date >= startDate &&
        record.date <= endDate
    );

    const attendanceStats = {
      totalRecords: filteredAttendance.length,
      presentDays: filteredAttendance.filter((r) => r.status === "Present")
        .length,
      lateDays: filteredAttendance.filter((r) => r.status === "Late").length,
      absentDays: filteredAttendance.filter((r) => r.status === "Absent")
        .length,
      undertimeDays: filteredAttendance.filter((r) => r.status === "Undertime")
        .length,
      avgHours:
        filteredAttendance.reduce((sum, r) => sum + r.totalHours, 0) /
          filteredAttendance.length || 0,
      attendanceRate:
        (filteredAttendance.filter((r) =>
          ["Present", "Late"].includes(r.status)
        ).length /
          filteredAttendance.length) *
          100 || 0,
    };

    // Payroll metrics
    const filteredPayroll = payrollRecords.filter(
      (record) =>
        employeeIds.includes(record.employeeId) &&
        record.payPeriodStart >= startDate &&
        record.payPeriodEnd <= endDate
    );

    const payrollStats = {
      totalPayroll: filteredPayroll.reduce((sum, r) => sum + r.netPay, 0),
      avgSalary:
        filteredPayroll.reduce((sum, r) => sum + r.netPay, 0) /
          filteredPayroll.length || 0,
      totalDeductions: filteredPayroll.reduce(
        (sum, r) => sum + r.deductions.totalDeductions,
        0
      ),
      overtimePay: filteredPayroll.reduce((sum, r) => sum + r.overtime, 0),
      totalHours: filteredPayroll.reduce((sum, r) => sum + r.hoursWorked, 0),
    };

    // Performance metrics
    const filteredRatings = ratings.filter((rating) =>
      employeeIds.includes(rating.employeeId)
    );

    const performanceStats = {
      avgRating:
        filteredRatings.reduce((sum, r) => sum + r.averageScore, 0) /
          filteredRatings.length || 0,
      topPerformers: getTopPerformers(5).filter((p) =>
        employeeIds.includes(p.employeeId)
      ),
      ratingDistribution: getRatingDistribution().filter((d) => d.count > 0),
    };

    // Leave metrics
    const filteredLeave = leaveRequests.filter(
      (request) =>
        employeeIds.includes(request.employeeId) &&
        request.startDate >= startDate &&
        request.endDate <= endDate
    );

    const leaveStats = {
      totalRequests: filteredLeave.length,
      approvedRequests: filteredLeave.filter((r) => r.status === "Approved")
        .length,
      pendingRequests: filteredLeave.filter((r) => r.status === "Pending")
        .length,
      rejectedRequests: filteredLeave.filter((r) => r.status === "Rejected")
        .length,
      totalDaysRequested: filteredLeave.reduce((sum, r) => sum + r.days, 0),
      avgDaysPerRequest:
        filteredLeave.reduce((sum, r) => sum + r.days, 0) /
          filteredLeave.length || 0,
    };

    // Goals metrics
    const filteredGoals = goals.filter((goal) =>
      employeeIds.includes(goal.employeeId)
    );

    const goalStats = {
      totalGoals: filteredGoals.length,
      completedGoals: filteredGoals.filter((g) => g.status === "completed")
        .length,
      inProgressGoals: filteredGoals.filter((g) => g.status === "in-progress")
        .length,
      notStartedGoals: filteredGoals.filter((g) => g.status === "not-started")
        .length,
      completionRate:
        (filteredGoals.filter((g) => g.status === "completed").length /
          filteredGoals.length) *
          100 || 0,
    };

    return {
      workforce: {
        totalEmployees: filteredEmployees.length,
        activeEmployees: filteredEmployees.filter(
          (emp) => emp.status === "Active"
        ).length,
        inactiveEmployees: filteredEmployees.filter(
          (emp) => emp.status === "Inactive"
        ).length,
        onLeaveEmployees: filteredEmployees.filter(
          (emp) => emp.status === "On Leave"
        ).length,
        avgTenure: calculateAvgTenure(filteredEmployees),
        departmentDistribution:
          calculateDepartmentDistribution(filteredEmployees),
      },
      attendance: attendanceStats,
      payroll: payrollStats,
      performance: performanceStats,
      leave: leaveStats,
      goals: goalStats,
    };
  };

  const calculateAvgTenure = (emps: any[]) => {
    const now = new Date();
    const tenures = emps.map((emp) => {
      const hireDate = new Date(emp.hireDate);
      return (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    });
    return tenures.reduce((sum, t) => sum + t, 0) / tenures.length || 0;
  };

  const calculateDepartmentDistribution = (emps: any[]) => {
    const distribution: { [key: string]: number } = {};
    emps.forEach((emp) => {
      distribution[emp.department] = (distribution[emp.department] || 0) + 1;
    });
    return Object.entries(distribution).map(([dept, count]) => ({
      department: dept,
      count,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous)
      return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (current < previous)
      return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const metrics = calculateMetrics();

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const exportReport = () => {
    const reportData = {
      reportType: reportTypes.find((t) => t.id === selectedReport)?.name,
      dateRange:
        dateRange === "custom"
          ? `${customStartDate} to ${customEndDate}`
          : dateRange,
      department: department,
      generatedAt: new Date().toISOString(),
      metrics: metrics,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedReport}_report_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, change, icon, color, subtitle }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        {change !== undefined && getTrendIcon(change, 0)}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {change !== undefined && (
          <p
            className={`text-xs mt-1 ${
              change > 0
                ? "text-green-600"
                : change < 0
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}% from last period
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      key={refreshKey}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-blue-600" />
            Advanced Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive HR insights and business intelligence
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={refreshData}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportReport}
            className="btn-primary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="font-semibold text-gray-900">Analytics Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="form-input"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Time Period</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="form-input"
              >
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label className="form-label">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-input"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
            {dateRange === "custom" && (
              <div>
                <label className="form-label">Custom Range</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Type Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 rounded-lg text-left transition-all duration-200 ${
                  selectedReport === type.id
                    ? "bg-blue-50 border-2 border-blue-200"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center mb-2">
                  <type.icon
                    className={`w-5 h-5 mr-2 ${
                      selectedReport === type.id
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      selectedReport === type.id
                        ? "text-blue-900"
                        : "text-gray-700"
                    }`}
                  >
                    {type.name}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Dashboard */}
      {selectedReport === "overview" && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Workforce"
              value={metrics.workforce.totalEmployees}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              color="bg-blue-100"
              subtitle={`${metrics.workforce.activeEmployees} active employees`}
            />
            <StatCard
              title="Attendance Rate"
              value={formatPercentage(metrics.attendance.attendanceRate)}
              icon={<Clock className="w-6 h-6 text-green-600" />}
              color="bg-green-100"
              subtitle={`${metrics.attendance.avgHours.toFixed(
                1
              )} avg hours/day`}
            />
            <StatCard
              title="Total Payroll"
              value={formatCurrency(metrics.payroll.totalPayroll)}
              icon={<DollarSign className="w-6 h-6 text-purple-600" />}
              color="bg-purple-100"
              subtitle={`${formatCurrency(
                metrics.payroll.avgSalary
              )} avg salary`}
            />
            <StatCard
              title="Performance Score"
              value={metrics.performance.avgRating.toFixed(1)}
              icon={<Award className="w-6 h-6 text-yellow-600" />}
              color="bg-yellow-100"
              subtitle="Average team performance"
            />
          </div>

          {/* Department Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Workforce Distribution by Department
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {metrics.workforce.departmentDistribution.map(
                    (dept, index) => (
                      <div
                        key={dept.department}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3`}
                            style={{
                              backgroundColor: `hsl(${index * 40}, 70%, 50%)`,
                            }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">
                            {dept.department}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">
                            {dept.count}
                          </span>
                          <span className="text-xs text-gray-500">
                            (
                            {(
                              (dept.count / metrics.workforce.totalEmployees) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      Department Distribution Chart
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Interactive chart placeholder
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Leave Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Requests</span>
                  <span className="font-medium">
                    {metrics.leave.totalRequests}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="font-medium text-green-600">
                    {metrics.leave.approvedRequests}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-medium text-yellow-600">
                    {metrics.leave.pendingRequests}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Avg Days/Request
                  </span>
                  <span className="font-medium">
                    {metrics.leave.avgDaysPerRequest.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Goals Progress
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Goals</span>
                  <span className="font-medium">
                    {metrics.goals.totalGoals}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">
                    {metrics.goals.completedGoals}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-medium text-blue-600">
                    {metrics.goals.inProgressGoals}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-medium">
                    {formatPercentage(metrics.goals.completionRate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-purple-600" />
                Top Performers
              </h4>
              <div className="space-y-3">
                {metrics.performance.topPerformers
                  .slice(0, 4)
                  .map((performer, index) => {
                    const employee = employees.find(
                      (emp) => emp.employeeId === performer.employeeId
                    );
                    return (
                      <div
                        key={performer.employeeId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700 truncate">
                            {employee?.name || "Unknown Employee"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {performer.averageScore.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Analytics */}
      {selectedReport === "attendance" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Attendance Rate"
              value={formatPercentage(metrics.attendance.attendanceRate)}
              icon={<CheckCircle className="w-6 h-6 text-green-600" />}
              color="bg-green-100"
            />
            <StatCard
              title="Late Arrivals"
              value={metrics.attendance.lateDays}
              icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
              color="bg-yellow-100"
            />
            <StatCard
              title="Absences"
              value={metrics.attendance.absentDays}
              icon={<XCircle className="w-6 h-6 text-red-600" />}
              color="bg-red-100"
            />
            <StatCard
              title="Avg Daily Hours"
              value={metrics.attendance.avgHours.toFixed(1)}
              icon={<Clock className="w-6 h-6 text-blue-600" />}
              color="bg-blue-100"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Attendance Trends</h3>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Daily Attendance Trend Chart</p>
                  <p className="text-xs text-gray-500">
                    Shows attendance patterns over time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Intelligence */}
      {selectedReport === "payroll" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Payroll"
              value={formatCurrency(metrics.payroll.totalPayroll)}
              icon={<DollarSign className="w-6 h-6 text-green-600" />}
              color="bg-green-100"
            />
            <StatCard
              title="Average Salary"
              value={formatCurrency(metrics.payroll.avgSalary)}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              color="bg-blue-100"
            />
            <StatCard
              title="Total Deductions"
              value={formatCurrency(metrics.payroll.totalDeductions)}
              icon={<Minus className="w-6 h-6 text-red-600" />}
              color="bg-red-100"
            />
            <StatCard
              title="Overtime Pay"
              value={formatCurrency(metrics.payroll.overtimePay)}
              icon={<Zap className="w-6 h-6 text-purple-600" />}
              color="bg-purple-100"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Salary Distribution
                </h3>
              </div>
              <div className="p-6">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Salary Range Distribution</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Payroll Trends</h3>
              </div>
              <div className="p-6">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Monthly Payroll Trends</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Analytics */}
      {selectedReport === "performance" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Average Rating"
              value={metrics.performance.avgRating.toFixed(2)}
              icon={<Award className="w-6 h-6 text-yellow-600" />}
              color="bg-yellow-100"
            />
            <StatCard
              title="Top Performers"
              value={metrics.performance.topPerformers.length}
              icon={<TrendingUp className="w-6 h-6 text-green-600" />}
              color="bg-green-100"
            />
            <StatCard
              title="Reviews Completed"
              value={ratings.length}
              icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
              color="bg-blue-100"
            />
            <StatCard
              title="Improvement Needed"
              value={ratings.filter((r) => r.averageScore < 3).length}
              icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
              color="bg-red-100"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Performance Distribution
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {metrics.performance.ratingDistribution.map(
                    (range, index) => (
                      <div
                        key={range.rating}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {range.rating}
                        </span>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">
                            {range.count} employees
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (range.count / ratings.length) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      Performance Rating Distribution
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other report types follow similar patterns */}
      {["leave", "workforce", "goals"].includes(selectedReport) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {reportTypes.find((t) => t.id === selectedReport)?.name}
            </h3>
          </div>
          <div className="p-6">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {
                    reportTypes.find((t) => t.id === selectedReport)
                      ?.description
                  }
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Advanced analytics and visualizations coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
