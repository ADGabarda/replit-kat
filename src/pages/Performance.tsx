import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useEmployee } from "../contexts/EmployeeContext";
import { usePerformance } from "../contexts/PerformanceContext";
import { useGoals } from "../contexts/GoalsContext";
import SupervisorEvaluationModal from "../components/SupervisorEvaluationModal";
import {
  Award,
  Target,
  TrendingUp,
  Star,
  Calendar,
  User,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Users,
  Trophy,
  PieChart,
  Filter,
  Send,
  MessageSquare,
  X,
  Download,
} from "lucide-react";
import { GoalViewModal, GoalFormModal } from "../components/GoalModals";

const Performance: React.FC = () => {
  const { user, getUsers } = useAuth();
  const { employees } = useEmployee();
  const {
    ratings,
    getEmployeeAverageScore,
    getTopPerformers,
    getRatingDistribution,
    getSupervisorRatings,
  } = usePerformance();
  const { goals, addGoal, updateGoal, deleteGoal, filterGoals } = useGoals();

  const [activeTab, setActiveTab] = useState<
    "overview" | "goals" | "feedback" | "supervisor"
  >("overview");
  const [evaluationModal, setEvaluationModal] = useState<{
    isOpen: boolean;
    employeeId: string;
    month: string;
  }>({
    isOpen: false,
    employeeId: "",
    month: "",
  });

  // State for Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  // 360° Feedback State
  const [feedbacks, setFeedbacks] = useState<any[]>(() => {
    const stored = localStorage.getItem("afflatus_360_feedbacks");
    return stored ? JSON.parse(stored) : [];
  });
  const [feedbackForm, setFeedbackForm] = useState<{
    targetEmployeeId: string;
    feedback: string;
    rating: number;
    isAnonymous: boolean;
  }>({
    targetEmployeeId: "",
    feedback: "",
    rating: 5,
    isAnonymous: true,
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedFeedbackEmployee, setSelectedFeedbackEmployee] =
    useState<any>(null);

  const isAdmin =
    user?.role &&
    ["President/CEO", "Vice President", "IT Head", "HR", "Admin"].includes(
      user.role
    );
  const isSupervisor =
    user?.role &&
    ["President/CEO", "Vice President", "HR"].includes(
      user.role
    );

  const currentMonth = new Date().toISOString().slice(0, 7); // Format: "2024-12"
  const userAverageScore = user ? getEmployeeAverageScore(user.id) : 0;
  const topPerformers = getTopPerformers(10);
  const ratingDistribution = getRatingDistribution();

  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  useEffect(() => {
    try {
      const users = getUsers();
      setAllEmployees(users);
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  }, [getUsers]);

  // Performance data structure
  // 360° Feedback Helper Functions
  const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

  const saveFeedbacks = (feedbacks: any[]) => {
    localStorage.setItem("afflatus_360_feedbacks", JSON.stringify(feedbacks));
  };

  const isEndOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysLeft = lastDay.getDate() - now.getDate();
    return daysLeft <= 5; // Last 5 days of the month
  };

  const hasSubmittedFeedbackTo = (targetEmployeeId: string) => {
    const currentMonth = getCurrentMonth();
    return feedbacks.some(
      (f) =>
        f.fromEmployeeId === user?.id &&
        f.toEmployeeId === targetEmployeeId &&
        f.month === currentMonth
    );
  };

  const getMyReceivedFeedbacks = () => {
    return feedbacks.filter((f) => f.toEmployeeId === user?.id);
  };

  const getPendingFeedbacks = () => {
    if (!user) return [];
    return employees.filter(
      (emp) => emp.id !== user.id && !hasSubmittedFeedbackTo(emp.id)
    );
  };

  const submitFeedback = () => {
    if (
      !user ||
      !feedbackForm.targetEmployeeId ||
      !feedbackForm.feedback.trim()
    )
      return;

    const newFeedback = {
      id: Date.now().toString(),
      fromEmployeeId: user.id,
      fromEmployeeName: feedbackForm.isAnonymous ? "Anonymous" : user.name,
      toEmployeeId: feedbackForm.targetEmployeeId,
      feedback: feedbackForm.feedback,
      rating: feedbackForm.rating,
      month: getCurrentMonth(),
      isAnonymous: feedbackForm.isAnonymous,
      createdAt: new Date().toISOString(),
    };

    const updatedFeedbacks = [...feedbacks, newFeedback];
    setFeedbacks(updatedFeedbacks);
    saveFeedbacks(updatedFeedbacks);

    // Reset form
    setFeedbackForm({
      targetEmployeeId: "",
      feedback: "",
      rating: 5,
      isAnonymous: true,
    });
    setShowFeedbackForm(false);
    setSelectedFeedbackEmployee(null);
  };

  const openFeedbackForm = (employee: any) => {
    setSelectedFeedbackEmployee(employee);
    setFeedbackForm({
      ...feedbackForm,
      targetEmployeeId: employee.id,
    });
    setShowFeedbackForm(true);
  };

  const [filterStatus, setFilterStatus] = useState<
    "All" | "On Track" | "Completed" | "Behind"
  >("All");

  const filteredGoals = React.useMemo(() => {
    return filterGoals(filterStatus === "All" ? undefined : filterStatus);
  }, [filterGoals, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "status-active";
      case "On Track":
        return "bg-blue-100 text-blue-800";
      case "Behind":
        return "status-inactive";
      default:
        return "status-pending";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-green-500"; // Green for 90-100%
    if (progress >= 70) return "bg-yellow-500"; // Yellow for 70-89%
    return "bg-red-500"; // Red for <70%
  };

  const getRatingColor = (score: number): string => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 4.0) return "text-blue-600";
    if (score >= 3.5) return "text-yellow-600";
    if (score >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  const openEvaluationModal = (employeeId: string) => {
    setEvaluationModal({
      isOpen: true,
      employeeId,
      month: currentMonth,
    });
  };

  const closeEvaluationModal = () => {
    setEvaluationModal({
      isOpen: false,
      employeeId: "",
      month: "",
    });
  };

  // Get supervisees (employees under current user's supervision)
  const supervisees = employees.filter((emp) => {
    if (!isSupervisor || !user) return false;
    // In a real system, you'd have a proper hierarchy mapping
    // For now, assume admins/managers supervise everyone except other admins
    const adminRoles = [
      "President/CEO",
      "Vice President",
      "IT Head",
      "HR",
      "Admin",
    ];
    return !adminRoles.includes(emp.role) && emp.id !== user.id;
  });

  // Modal handlers
  const handleViewGoal = (goal: any) => {
    setSelectedGoal(goal);
    setIsViewModalOpen(true);
  };

  const handleEditGoal = (goal: any) => {
    setSelectedGoal(goal);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const handleAddGoal = () => {
    setSelectedGoal(null);
    setFormMode("add");
    setIsFormModalOpen(true);
  };

  const closeModals = () => {
    setIsViewModalOpen(false);
    setIsFormModalOpen(false);
    setSelectedGoal(null);
  };

  const handleProgressClick = (
    goal: any,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const newProgress = Math.round((clickX / width) * 100);
    updateGoal(goal.id, { progress: Math.min(Math.max(newProgress, 0), 100) });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Performance Management
          </h1>
          <p className="text-gray-600">
            Track goals, reviews, and performance ratings
          </p>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="dashboard-grid mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Your Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {userAverageScore.toFixed(1)}/5.0
              </p>
              <p className={`text-xs ${getRatingColor(userAverageScore)}`}>
                {userAverageScore >= 4.5
                  ? "Excellent"
                  : userAverageScore >= 4.0
                  ? "Very Good"
                  : userAverageScore >= 3.5
                  ? "Good"
                  : "Needs Improvement"}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Goals Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {goals.filter((g) => g.status === "Completed").length}/
                {goals.length}
              </p>
              <p className="text-xs text-blue-600">This quarter</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Company Rank</p>
              <p className="text-2xl font-bold text-gray-900">
                #
                {topPerformers.findIndex((p) => p.employeeId === user?.id) +
                  1 || "N/A"}
              </p>
              <p className="text-xs text-green-600">Top performers</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Ratings</p>
              <p className="text-2xl font-bold text-gray-900">
                {ratings.length}
              </p>
              <p className="text-xs text-purple-600">All employees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: "overview", name: "Overview", icon: BarChart3 },
              { id: "goals", name: "Goals & KPIs", icon: Target },
              { id: "feedback", name: "360° Feedback", icon: Star },
              ...(isSupervisor
                ? [{ id: "supervisor", name: "Supervisor Panel", icon: Users }]
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
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Performance Overview
              </h2>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Top Performers */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      Top 10 Performers
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="space-y-3">
                      {topPerformers.slice(0, 10).map((performer, index) => {
                        const employee = employees.find(
                          (emp) => emp.id === performer.employeeId
                        );
                        return (
                          <div
                            key={performer.employeeId}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  index === 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : index === 1
                                    ? "bg-gray-100 text-gray-800"
                                    : index === 2
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">
                                  {employee?.name || "Unknown"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {employee?.role}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-semibold ${getRatingColor(
                                  performer.averageScore
                                )}`}
                              >
                                {performer.averageScore.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-500">avg score</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      Rating Distribution
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="space-y-4">
                      {ratingDistribution.map((item, index) => (
                        <div
                          key={item.rating}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full mr-3 ${
                                index % 6 === 0
                                  ? "bg-green-500"
                                  : index % 6 === 1
                                  ? "bg-blue-500"
                                  : index % 6 === 2
                                  ? "bg-yellow-500"
                                  : index % 6 === 3
                                  ? "bg-orange-500"
                                  : index % 6 === 4
                                  ? "bg-red-500"
                                  : "bg-purple-500"
                              }`}
                            ></div>
                            <span className="text-sm text-gray-700">
                              {item.rating}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Award className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Performance Rating Received
                        </p>
                        <p className="text-xs text-gray-600">
                          Latest monthly evaluation • 2 days ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Goal Updated
                        </p>
                        <p className="text-xs text-gray-600">
                          Sales target progress: 85% • 1 week ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <Star className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          360° Feedback Received
                        </p>
                        <p className="text-xs text-gray-600">
                          From team members • 2 weeks ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Supervisor Tab */}
          {activeTab === "supervisor" && isSupervisor && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Supervisor Panel
                </h2>
                <div className="text-sm text-gray-600">
                  Evaluating for:{" "}
                  {new Date(currentMonth + "-01").toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Monthly Performance Evaluation
                  </h3>
                  <p className="text-blue-800 text-sm">
                    Evaluate your team members based on the following criteria:
                    Quality of Work, Productivity, Teamwork, Communication,
                    Initiative, and Punctuality. Each criterion is rated on a
                    scale of 1-5.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Team Members to Evaluate
                </h3>
                {allEmployees
                  .filter((emp) => emp.role !== "Master Admin")
                  .map((employee) => {
                    const hasRating = ratings.some(
                      (r) =>
                        r.employeeId === employee.id &&
                        r.month === currentMonth &&
                        r.supervisorId === user?.id
                    );
                    const employeeRating = ratings.find(
                      (r) =>
                        r.employeeId === employee.id &&
                        r.month === currentMonth &&
                        r.supervisorId === user?.id
                    );

                    return (
                      <div
                        key={employee.id}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <h4 className="font-semibold text-gray-900">
                                {employee.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {employee.role} • {employee.department}
                              </p>
                              {hasRating && (
                                <div className="flex items-center mt-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {employeeRating?.averageScore.toFixed(1)}
                                    /5.0
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {hasRating ? (
                              <>
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Evaluated
                                </span>
                                <button
                                  onClick={() =>
                                    openEvaluationModal(employee.id)
                                  }
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => openEvaluationModal(employee.id)}
                                className="btn-primary text-sm flex items-center"
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Evaluate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === "goals" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  Goals & KPIs
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select
                      className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-lg shadow leading-tight focus:outline-none focus:shadow-outline text-sm"
                      value={filterStatus}
                      onChange={(e) =>
                        setFilterStatus(e.target.value as typeof filterStatus)
                      }
                      aria-label="Filter goals by status"
                    >
                      <option value="All">All Statuses</option>
                      <option value="On Track">On Track</option>
                      <option value="Completed">Completed</option>
                      <option value="Behind">Behind</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414-5.657 5.657-5.657-5.657L4.343 8l1.414 1.414.707.707 2.121 2.121z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    className="btn-primary text-sm flex items-center"
                    onClick={handleAddGoal}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </button>
                </div>
              </div>

              {filteredGoals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No goals found.</p>
                  <p className="text-sm">
                    Click "Add Goal" to create your first goal.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="border border-gray-200 rounded-lg p-6 card-hover-effect"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {goal.title}
                          </h3>
                          <div className="flex items-center space-x-4">
                            <span
                              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                goal.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : goal.status === "On Track"
                                  ? "bg-blue-100 text-blue-800"
                                  : goal.status === "Behind"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {goal.status}
                            </span>
                            <span className="text-sm text-gray-600 flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              Progress: {goal.progress}%
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                            onClick={() => handleViewGoal(goal)}
                            aria-label={`View details for ${goal.title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                            onClick={() => handleEditGoal(goal)}
                            aria-label={`Edit ${goal.title}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>
                            {goal.progress}% of {goal.target}%
                          </span>
                        </div>
                        <div
                          className="w-full bg-gray-200 rounded-full h-2.5 cursor-pointer relative"
                          onClick={(e) => handleProgressClick(goal, e)}
                          title={`Click to update progress. Current: ${goal.progress}%`}
                        >
                          <div
                            className={`h-2.5 rounded-full ${getProgressColor(
                              goal.progress
                            )} transition-all duration-300 ease-in-out`}
                            style={{ width: `${goal.progress}%` }}
                            role="progressbar"
                            aria-valuenow={goal.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Enhanced 360° Feedback Tab */}
          {activeTab === "feedback" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Star className="w-6 h-6 mr-2" />
                  360° Feedback
                </h2>
                <div className="text-sm text-gray-600">
                  Current Month:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Monthly Feedback Alert */}
              {isEndOfMonth() && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-yellow-900">
                        Monthly Feedback Period Active
                      </h3>
                      <p className="text-yellow-800 text-sm">
                        Submit feedback for all team members before the month
                        ends. You have {getPendingFeedbacks().length} pending
                        feedback(s).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Feedbacks Section */}
              {isEndOfMonth() && getPendingFeedbacks().length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Submit Feedback ({getPendingFeedbacks().length} pending)
                  </h3>
                  <div className="grid gap-4">
                    {getPendingFeedbacks().map((employee) => (
                      <div
                        key={employee.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium text-gray-900">
                              {employee.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {employee.role} • {employee.department}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openFeedbackForm(employee)}
                          className="btn-primary text-sm flex items-center"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Give Feedback
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Form Modal */}
              {showFeedbackForm && selectedFeedbackEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Feedback for {selectedFeedbackEmployee.name}
                      </h3>
                      <button
                        onClick={() => setShowFeedbackForm(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating (1-5)
                          </label>
                          <select
                            value={feedbackForm.rating}
                            onChange={(e) =>
                              setFeedbackForm({
                                ...feedbackForm,
                                rating: Number(e.target.value),
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={5}>5 - Excellent</option>
                            <option value={4}>4 - Very Good</option>
                            <option value={3}>3 - Good</option>
                            <option value={2}>2 - Fair</option>
                            <option value={1}>1 - Needs Improvement</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Feedback Comments
                          </label>
                          <textarea
                            rows={4}
                            value={feedbackForm.feedback}
                            onChange={(e) =>
                              setFeedbackForm({
                                ...feedbackForm,
                                feedback: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Provide constructive feedback..."
                            required
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="anonymous"
                            checked={feedbackForm.isAnonymous}
                            onChange={(e) =>
                              setFeedbackForm({
                                ...feedbackForm,
                                isAnonymous: e.target.checked,
                              })
                            }
                            className="mr-2"
                          />
                          <label
                            htmlFor="anonymous"
                            className="text-sm text-gray-700"
                          >
                            Submit anonymously
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          onClick={() => setShowFeedbackForm(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitFeedback}
                          disabled={!feedbackForm.feedback.trim()}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Received Feedbacks */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Feedback Received
                </h3>
                {getMyReceivedFeedbacks().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No feedback received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getMyReceivedFeedbacks().map((feedback) => (
                      <div
                        key={feedback.id}
                        className="border border-gray-200 rounded-lg p-6 card-hover-effect"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                360° Feedback
                              </h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < feedback.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              From: {feedback.fromEmployeeName} •{" "}
                              {new Date(
                                feedback.createdAt
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-gray-700">{feedback.feedback}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <GoalViewModal
        isOpen={isViewModalOpen}
        onClose={closeModals}
        goal={selectedGoal}
      />
      <GoalFormModal
        isOpen={isFormModalOpen}
        onClose={closeModals}
        goal={selectedGoal}
        mode={formMode}
      />

      {/* Evaluation Modal */}
      <SupervisorEvaluationModal
        isOpen={evaluationModal.isOpen}
        onClose={closeEvaluationModal}
        employeeId={evaluationModal.employeeId}
        month={evaluationModal.month}
      />
    </div>
  );
};

export default Performance;
