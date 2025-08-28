import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Building2, User, Lock, Eye, EyeOff, Shield } from "lucide-react";

const Login: React.FC = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLoading) return;

    try {
      await login(employeeId, password);
      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-2 rounded-2xl shadow-md">
              <img src="/logo-only.jpg" alt="Office" className="w-16 h-16" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Employee Login</h2>
          <p className="mt-1 text-gray-600 text-sm">
            Afflatus Realty Inc. HR System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
              <Shield className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Employee ID */}
          <div>
            <label
              htmlFor="employeeId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Employee ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 pl-12 pr-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                placeholder="Enter your Employee ID"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 pl-12 pr-12 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ca2128] text-white font-semibold py-3 rounded-lg shadow-lg hover:opacity-90 active:bg-[#a81b21] focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-5 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm shadow-inner">
          <h3 className="font-medium text-gray-700 mb-2">Demo Credentials:</h3>
          <ul className="space-y-1 text-gray-600">
            <li>
              <strong>Master Admin:</strong> ADMIN001 / admin123
            </li>
            <li>
              <strong>CEO:</strong> EMP001 / admin123
            </li>
            <li>
              <strong>HR:</strong> EMP002 / hr123
            </li>
            <li>
              <strong>Employee:</strong> EMP003 / emp123
            </li>
          </ul>
        </div>

        {/* Security Notice */}
        <p className="text-xs text-gray-500 text-center mt-4">
          This system is for authorized personnel only. All activities are
          logged and monitored.
        </p>
      </div>
    </div>
  );
};

export default Login;
