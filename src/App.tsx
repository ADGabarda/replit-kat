import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EmployeeProvider } from "./contexts/EmployeeContext";
import { LeaveProvider } from "./contexts/LeaveContext";
import { AttendanceProvider } from "./contexts/AttendanceContext";
import { PayrollProvider } from "./contexts/PayrollContext";
import { PerformanceProvider } from "./contexts/PerformanceContext";
import { GoalsProvider } from "./contexts/GoalsContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import Employees from "./pages/Employees";
import LeaveManagement from "./pages/LeaveManagement";
import Attendance from "./pages/Attendance";
import Calendar from "./pages/Calendar";
import Payroll from "./pages/Payroll";
import Performance from "./pages/Performance";
import Goals from "./pages/Goals";
import Recruitment from "./pages/Recruitment";

import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <LeaveProvider>
          <AttendanceProvider>
            <PayrollProvider>
              <PerformanceProvider>
                <GoalsProvider>
                  {" "}
                  {/* ✅ Wrap with GoalsProvider */}
                  <Router>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/user-management"
                          element={
                            <ProtectedRoute
                              requiredRoles={["Master Admin", "IT Head"]}
                            >
                              <UserManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/employees"
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                "Master Admin",
                                "President/CEO",
                                "Vice President",
                                "IT Head",
                                "HR",
                                "Admin",
                              ]}
                            >
                              <Employees />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/leave"
                          element={
                            <ProtectedRoute>
                              <LeaveManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/attendance"
                          element={
                            <ProtectedRoute>
                              <Attendance />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/calendar"
                          element={
                            <ProtectedRoute>
                              <Calendar />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/payroll"
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                "Master Admin",
                                "President/CEO",
                                "Vice President",
                                "IT Head",
                                "HR",
                                "Admin",
                              ]}
                            >
                              <Payroll />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/performance"
                          element={
                            <ProtectedRoute>
                              <Performance />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/goals"
                          element={
                            // ✅ New route for goals/KPI
                            <ProtectedRoute>
                              <Goals />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/recruitment"
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                "Master Admin",
                                "President/CEO",
                                "Vice President",
                                "IT Head",
                                "HR",
                                "Admin",
                              ]}
                            >
                              <Recruitment />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/reports"
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                "Master Admin",
                                "President/CEO",
                                "Vice President",
                                "IT Head",
                                "HR",
                                "Admin",
                              ]}
                            >
                              <Reports />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute requiredRoles={["Master Admin"]}>
                              <Settings />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Layout>
                  </Router>
                </GoalsProvider>
              </PerformanceProvider>
            </PayrollProvider>
          </AttendanceProvider>
        </LeaveProvider>
      </EmployeeProvider>
    </AuthProvider>
  );
}

export default App;
