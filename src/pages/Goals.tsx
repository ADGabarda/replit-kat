import React, { useState } from "react";
import { useGoals } from "../contexts/GoalsContext";
import { GoalViewModal, GoalFormModal } from "../components/GoalModals";
import { Target, TrendingUp, Plus, Eye, Edit, Filter } from "lucide-react";

const Goals: React.FC = () => {
  const { goals, updateGoal, filterGoals } = useGoals();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<
    "All" | "On Track" | "Completed" | "Behind"
  >("All");
  const [sortBy, setSortBy] = useState<
    "progress" | "title" | "dueDate" | "priority"
  >("progress");

  const filteredGoals = React.useMemo(() => {
    return filterGoals(
      filterStatus === "All" ? undefined : filterStatus,
      sortBy
    );
  }, [filterGoals, filterStatus, sortBy]);

  const getStatusColor = (status: string) => {
    const colors: any = {
      Completed: "bg-green-100 text-green-800",
      "On Track": "bg-blue-100 text-blue-800",
      Behind: "bg-red-100 text-red-800",
      "Not Started": "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-green-500";
    if (progress >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

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

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "Completed").length;
  const onTrackGoals = goals.filter((g) => g.status === "On Track").length;
  const behindGoals = goals.filter((g) => g.status === "Behind").length;
  const averageProgress =
    totalGoals > 0
      ? Math.round(
          goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
            <Target className="w-8 h-8 mr-3" /> Goals & KPIs
          </h1>
          <p className="text-gray-600">
            Track and manage your performance goals and key performance
            indicators
          </p>
        </div>
        <button
          className="btn-primary mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          onClick={handleAddGoal}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Goals",
            icon: <Target className="w-6 h-6 text-blue-600" />,
            bg: "bg-blue-100",
            count: totalGoals,
            subtext: "Active goals",
            subtextColor: "text-blue-600",
          },
          {
            title: "Completed",
            icon: <TrendingUp className="w-6 h-6 text-green-600" />,
            bg: "bg-green-100",
            count: completedGoals,
            subtext: `${Math.round(
              (completedGoals / totalGoals || 0) * 100
            )}% completion rate`,
            subtextColor: "text-green-600",
          },
          {
            title: "On Track",
            icon: <Target className="w-6 h-6 text-yellow-600" />,
            bg: "bg-yellow-100",
            count: onTrackGoals,
            subtext: "Progress good",
            subtextColor: "text-yellow-600",
          },
          {
            title: "Behind",
            icon: <Target className="w-6 h-6 text-red-600" />,
            bg: "bg-red-100",
            count: behindGoals,
            subtext: "Needs attention",
            subtextColor: "text-red-600",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white shadow-sm p-5 rounded-lg flex items-center"
          >
            <div className={`p-3 rounded-full ${stat.bg}`}>{stat.icon}</div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-xl font-bold text-gray-900">{stat.count}</p>
              <p className={`text-xs ${stat.subtextColor}`}>{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">
                Filter:
              </label>
              <select
                className="form-select border-gray-300 rounded-md shadow-sm"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as typeof filterStatus)
                }
              >
                <option value="All">All</option>
                <option value="On Track">On Track</option>
                <option value="Completed">Completed</option>
                <option value="Behind">Behind</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                className="form-select border-gray-300 rounded-md shadow-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="progress">Progress</option>
                <option value="title">Title</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredGoals.length} of {totalGoals} • Avg Progress:{" "}
            {averageProgress}%
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No goals found
            </h3>
            <p className="text-gray-600 mb-4">
              {filterStatus !== "All"
                ? `No goals with "${filterStatus}" status found.`
                : "Get started by creating your first goal."}
            </p>
            <button
              className="btn-primary flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleAddGoal}
            >
              <Plus className="w-4 h-4 mr-2" /> Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-lg p-5 border hover:shadow-md transition"
              >
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {goal.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                        goal.status
                      )}`}
                    >
                      {goal.status}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(
                        goal.priority
                      )}`}
                    >
                      {goal.priority}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 text-sm text-gray-600 mb-3 gap-2">
                  <div>
                    <strong>Due:</strong>{" "}
                    {new Date(goal.dueDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Responsible:</strong> {goal.responsiblePerson}
                  </div>
                  <div>
                    <strong>Category:</strong> {goal.category}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Progress
                    </span>
                    <span className="font-medium">
                      {goal.progress}% of {goal.target}%
                    </span>
                  </div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-3 cursor-pointer group relative"
                    onClick={(e) => handleProgressClick(goal, e)}
                  >
                    <div
                      className={`h-3 rounded-full ${getProgressColor(
                        goal.progress
                      )} transition-all`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                    <div className="absolute inset-0 flex justify-center items-center text-xs text-white font-medium opacity-0 group-hover:opacity-100">
                      Click to update
                    </div>
                  </div>
                </div>
                {goal.milestones?.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      <strong>Milestones:</strong>{" "}
                      {goal.milestones.filter((m) => m.completed).length}/
                      {goal.milestones.length} completed
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {goal.milestones.slice(0, 3).map((m) => (
                        <span
                          key={m.id}
                          className={`text-xs px-2 py-1 rounded-full ${
                            m.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {m.title}
                        </span>
                      ))}
                      {goal.milestones.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          +{goal.milestones.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    onClick={() => handleViewGoal(goal)}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                    onClick={() => handleEditGoal(goal)}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default Goals;
