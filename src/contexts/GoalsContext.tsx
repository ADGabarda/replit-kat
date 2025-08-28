import React, { createContext, useContext, useState } from "react";

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  status: "On Track" | "Completed" | "Behind" | "Not Started";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  responsiblePerson: string;
  category: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  completedDate?: string;
}

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "updatedAt">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  getGoalById: (id: string) => Goal | undefined;
  updateGoalProgress: (id: string, progress: number) => void;
  filterGoals: (status?: string, sortBy?: string) => Goal[];
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error("useGoals must be used within a GoalsProvider");
  }
  return context;
};

const STORAGE_KEY = "afflatus_goals";

const loadGoals = (): Goal[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // Sample goals for demonstration
  return [
    {
      id: "1",
      title: "Increase Sales by 20%",
      description:
        "Drive revenue growth through improved sales processes and customer engagement strategies.",
      progress: 85,
      target: 100,
      status: "On Track",
      priority: "High",
      dueDate: "2024-12-31",
      responsiblePerson: "Sales Team",
      category: "Revenue",
      milestones: [
        {
          id: "1",
          title: "Q1 Target Achievement",
          completed: true,
          dueDate: "2024-03-31",
          completedDate: "2024-03-28",
        },
        {
          id: "2",
          title: "Mid-year Review",
          completed: true,
          dueDate: "2024-06-30",
          completedDate: "2024-06-25",
        },
        {
          id: "3",
          title: "Q3 Assessment",
          completed: true,
          dueDate: "2024-09-30",
          completedDate: "2024-09-28",
        },
        {
          id: "4",
          title: "Year-end Target",
          completed: false,
          dueDate: "2024-12-31",
        },
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-12-01T00:00:00Z",
      notes: "Excellent progress so far, on track to exceed target.",
    },
    {
      id: "2",
      title: "Complete Leadership Training",
      description:
        "Enhance leadership capabilities through comprehensive training program.",
      progress: 100,
      target: 100,
      status: "Completed",
      priority: "Medium",
      dueDate: "2024-11-30",
      responsiblePerson: "HR Department",
      category: "Development",
      milestones: [
        {
          id: "1",
          title: "Module 1: Communication",
          completed: true,
          dueDate: "2024-09-15",
          completedDate: "2024-09-10",
        },
        {
          id: "2",
          title: "Module 2: Team Management",
          completed: true,
          dueDate: "2024-10-15",
          completedDate: "2024-10-12",
        },
        {
          id: "3",
          title: "Module 3: Strategic Thinking",
          completed: true,
          dueDate: "2024-11-15",
          completedDate: "2024-11-10",
        },
        {
          id: "4",
          title: "Final Assessment",
          completed: true,
          dueDate: "2024-11-30",
          completedDate: "2024-11-25",
        },
      ],
      createdAt: "2024-08-01T00:00:00Z",
      updatedAt: "2024-11-25T00:00:00Z",
    },
    {
      id: "3",
      title: "Improve Customer Satisfaction",
      description:
        "Enhance customer experience and satisfaction ratings through service improvements.",
      progress: 60,
      target: 100,
      status: "Behind",
      priority: "High",
      dueDate: "2025-03-31",
      responsiblePerson: "Customer Service",
      category: "Quality",
      milestones: [
        {
          id: "1",
          title: "Survey Implementation",
          completed: true,
          dueDate: "2024-10-31",
          completedDate: "2024-10-28",
        },
        {
          id: "2",
          title: "Process Improvements",
          completed: false,
          dueDate: "2024-12-31",
        },
        {
          id: "3",
          title: "Staff Training",
          completed: false,
          dueDate: "2025-01-31",
        },
        {
          id: "4",
          title: "Final Evaluation",
          completed: false,
          dueDate: "2025-03-31",
        },
      ],
      createdAt: "2024-09-01T00:00:00Z",
      updatedAt: "2024-11-15T00:00:00Z",
      notes: "Need to accelerate progress on process improvements.",
    },
  ];
};

const saveGoals = (goals: Goal[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
};

const getGoalStatus = (progress: number, dueDate: string): Goal["status"] => {
  const now = new Date();
  const due = new Date(dueDate);
  const daysDiff = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (progress >= 100) return "Completed";
  if (progress >= 70) return "On Track";
  if (daysDiff < 30 && progress < 70) return "Behind";
  return "On Track";
};

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [goals, setGoals] = useState<Goal[]>(loadGoals());

  const addGoal = (goalData: Omit<Goal, "id" | "createdAt" | "updatedAt">) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: getGoalStatus(goalData.progress, goalData.dueDate),
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === id) {
        const updated = {
          ...goal,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        if (updates.progress !== undefined || updates.dueDate !== undefined) {
          updated.status = getGoalStatus(
            updates.progress ?? goal.progress,
            updates.dueDate ?? goal.dueDate
          );
        }
        return updated;
      }
      return goal;
    });

    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  const deleteGoal = (id: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  const getGoalById = (id: string) => {
    return goals.find((goal) => goal.id === id);
  };

  const updateGoalProgress = (id: string, progress: number) => {
    updateGoal(id, { progress });
  };

  const filterGoals = (status?: string, sortBy?: string) => {
    let filtered = [...goals];

    if (status && status !== "All") {
      filtered = filtered.filter((goal) => goal.status === status);
    }

    if (sortBy) {
      switch (sortBy) {
        case "progress":
          filtered.sort((a, b) => b.progress - a.progress);
          break;
        case "title":
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "dueDate":
          filtered.sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          );
          break;
        case "priority":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          filtered.sort(
            (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
          );
          break;
      }
    }

    return filtered;
  };

  return (
    <GoalsContext.Provider
      value={{
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        getGoalById,
        updateGoalProgress,
        filterGoals,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};
