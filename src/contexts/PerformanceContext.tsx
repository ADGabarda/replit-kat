import React, { createContext, useContext, useState } from "react";

interface PerformanceRating {
  id: string;
  employeeId: string;
  supervisorId: string;
  month: string; // Format: "2024-12"
  ratings: {
    quality: number; // 1-5
    productivity: number; // 1-5
    teamwork: number; // 1-5
    communication: number; // 1-5
    initiative: number; // 1-5
    punctuality: number; // 1-5
  };
  averageScore: number;
  comments?: string;
  createdAt: string;
}

interface PerformanceContextType {
  ratings: PerformanceRating[];
  addRating: (
    rating: Omit<PerformanceRating, "id" | "averageScore" | "createdAt">
  ) => void;
  updateRating: (id: string, updates: Partial<PerformanceRating>) => void;
  getEmployeeRatings: (employeeId: string) => PerformanceRating[];
  getMonthlyRatings: (month: string) => PerformanceRating[];
  getEmployeeAverageScore: (employeeId: string) => number;
  getTopPerformers: (
    limit?: number
  ) => { employeeId: string; averageScore: number }[];
  getSupervisorRatings: (supervisorId: string) => PerformanceRating[];
  getRatingDistribution: () => { rating: string; count: number }[];
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(
  undefined
);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within a PerformanceProvider");
  }
  return context;
};

const STORAGE_KEY = "afflatus_performance_ratings";

const loadRatings = (): PerformanceRating[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveRatings = (ratings: PerformanceRating[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
};

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ratings, setRatings] = useState<PerformanceRating[]>(loadRatings());

  const calculateAverageScore = (
    ratingObj: PerformanceRating["ratings"]
  ): number => {
    const scores = Object.values(ratingObj);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const addRating = (
    ratingData: Omit<PerformanceRating, "id" | "averageScore" | "createdAt">
  ) => {
    const newRating: PerformanceRating = {
      ...ratingData,
      id: Date.now().toString(),
      averageScore: calculateAverageScore(ratingData.ratings),
      createdAt: new Date().toISOString(),
    };

    const updatedRatings = [...ratings, newRating];
    setRatings(updatedRatings);
    saveRatings(updatedRatings);
  };

  const updateRating = (id: string, updates: Partial<PerformanceRating>) => {
    const updatedRatings = ratings.map((rating) => {
      if (rating.id === id) {
        const updated = { ...rating, ...updates };
        if (updates.ratings) {
          updated.averageScore = calculateAverageScore(updates.ratings);
        }
        return updated;
      }
      return rating;
    });

    setRatings(updatedRatings);
    saveRatings(updatedRatings);
  };

  const getEmployeeRatings = (employeeId: string) => {
    return ratings.filter((rating) => rating.employeeId === employeeId);
  };

  const getMonthlyRatings = (month: string) => {
    return ratings.filter((rating) => rating.month === month);
  };

  const getEmployeeAverageScore = (employeeId: string) => {
    const employeeRatings = getEmployeeRatings(employeeId);
    if (employeeRatings.length === 0) return 0;

    const totalScore = employeeRatings.reduce(
      (sum, rating) => sum + rating.averageScore,
      0
    );
    return totalScore / employeeRatings.length;
  };

  const getTopPerformers = (limit = 10) => {
    const employeeScores = new Map<string, number[]>();

    ratings.forEach((rating) => {
      if (!employeeScores.has(rating.employeeId)) {
        employeeScores.set(rating.employeeId, []);
      }
      employeeScores.get(rating.employeeId)!.push(rating.averageScore);
    });

    const averages = Array.from(employeeScores.entries()).map(
      ([employeeId, scores]) => ({
        employeeId,
        averageScore:
          scores.reduce((sum, score) => sum + score, 0) / scores.length,
      })
    );

    return averages
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, limit);
  };

  const getSupervisorRatings = (supervisorId: string) => {
    return ratings.filter((rating) => rating.supervisorId === supervisorId);
  };

  const getRatingDistribution = () => {
    const distribution = new Map<string, number>();

    ratings.forEach((rating) => {
      const range = getRatingRange(rating.averageScore);
      distribution.set(range, (distribution.get(range) || 0) + 1);
    });

    return Array.from(distribution.entries()).map(([rating, count]) => ({
      rating,
      count,
    }));
  };

  const getRatingRange = (score: number): string => {
    if (score >= 4.5) return "4.5-5.0 (Excellent)";
    if (score >= 4.0) return "4.0-4.4 (Very Good)";
    if (score >= 3.5) return "3.5-3.9 (Good)";
    if (score >= 3.0) return "3.0-3.4 (Satisfactory)";
    if (score >= 2.5) return "2.5-2.9 (Fair)";
    return "1.0-2.4 (Needs Improvement)";
  };

  return (
    <PerformanceContext.Provider
      value={{
        ratings,
        addRating,
        updateRating,
        getEmployeeRatings,
        getMonthlyRatings,
        getEmployeeAverageScore,
        getTopPerformers,
        getSupervisorRatings,
        getRatingDistribution,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};
