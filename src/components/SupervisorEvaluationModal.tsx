import React, { useState } from "react";
import { X, Star, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useEmployee } from "../contexts/EmployeeContext";
import { usePerformance } from "../contexts/PerformanceContext";

interface SupervisorEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  month: string;
}

const SupervisorEvaluationModal: React.FC<SupervisorEvaluationModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  month,
}) => {
  const { user } = useAuth();
  const { getEmployee } = useEmployee();
  const { addRating, ratings } = usePerformance();

  const employee = getEmployee(employeeId);
  const existingRating = ratings.find(
    (r) =>
      r.employeeId === employeeId &&
      r.month === month &&
      r.supervisorId === user?.id
  );

  const [formData, setFormData] = useState({
    quality: existingRating?.ratings.quality || 3,
    productivity: existingRating?.ratings.productivity || 3,
    teamwork: existingRating?.ratings.teamwork || 3,
    communication: existingRating?.ratings.communication || 3,
    initiative: existingRating?.ratings.initiative || 3,
    punctuality: existingRating?.ratings.punctuality || 3,
    comments: existingRating?.comments || "",
  });

  const criteria = [
    {
      key: "quality",
      label: "Quality of Work",
      description: "Accuracy, thoroughness, and attention to detail",
    },
    {
      key: "productivity",
      label: "Productivity",
      description: "Efficiency and output in completing tasks",
    },
    {
      key: "teamwork",
      label: "Teamwork",
      description: "Collaboration and support for team members",
    },
    {
      key: "communication",
      label: "Communication",
      description: "Clarity and effectiveness in communication",
    },
    {
      key: "initiative",
      label: "Initiative",
      description: "Proactive approach and self-motivation",
    },
    {
      key: "punctuality",
      label: "Punctuality",
      description: "Timeliness and reliability",
    },
  ];

  const handleRatingChange = (criterion: string, rating: number) => {
    setFormData((prev) => ({
      ...prev,
      [criterion]: rating,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const { comments, ...ratings } = formData;

    addRating({
      employeeId,
      supervisorId: user.id,
      month,
      ratings,
      comments: comments || undefined,
    });

    onClose();
  };

  const getRatingText = (rating: number): string => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Below Average";
      case 3:
        return "Average";
      case 4:
        return "Good";
      case 5:
        return "Excellent";
      default:
        return "Average";
    }
  };

  const getRatingColor = (rating: number): string => {
    switch (rating) {
      case 1:
        return "text-red-600";
      case 2:
        return "text-orange-600";
      case 3:
        return "text-yellow-600";
      case 4:
        return "text-blue-600";
      case 5:
        return "text-green-600";
      default:
        return "text-yellow-600";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Performance Evaluation
            </h2>
            <p className="text-sm text-gray-600">
              {employee?.name} •{" "}
              {new Date(month + "-01").toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {criteria.map((criterion) => (
              <div
                key={criterion.key}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {criterion.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {criterion.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() =>
                          handleRatingChange(criterion.key, rating)
                        }
                        className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor:
                            formData[criterion.key as keyof typeof formData] ===
                            rating
                              ? "#eff6ff"
                              : "",
                          borderColor:
                            formData[criterion.key as keyof typeof formData] ===
                            rating
                              ? "#3b82f6"
                              : "",
                        }}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            formData[criterion.key as keyof typeof formData] >=
                            rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                        <span className="text-xs mt-1">{rating}</span>
                      </button>
                    ))}
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-lg font-semibold ${getRatingColor(
                        formData[
                          criterion.key as keyof typeof formData
                        ] as number
                      )}`}
                    >
                      {getRatingText(
                        formData[
                          criterion.key as keyof typeof formData
                        ] as number
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formData[criterion.key as keyof typeof formData]}/5
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, comments: e.target.value }))
                }
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide additional feedback, suggestions for improvement, or recognition..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center">
              <Save className="w-4 h-4 mr-2" />
              {existingRating ? "Update Evaluation" : "Submit Evaluation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupervisorEvaluationModal;
