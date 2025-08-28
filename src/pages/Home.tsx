import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  Award,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const Home: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {user.role} at Afflatus Realty Inc.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/dashboard" className="btn-primary flex items-center">
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link to="/profile" className="btn-secondary flex items-center">
                View Profile
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: Users,
                label: "Total Employees",
                value: "247",
                color: "blue",
              },
              {
                icon: Calendar,
                label: "Pending Leaves",
                value: "12",
                color: "green",
              },
              {
                icon: DollarSign,
                label: "Payroll This Month",
                value: "₱2.4M",
                color: "purple",
              },
              {
                icon: TrendingUp,
                label: "Performance",
                value: "94%",
                color: "yellow",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="stat-card p-4 bg-white rounded-lg shadow-md flex items-center"
              >
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                <Building2 className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Afflatus Realty Inc.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
                HR Management System
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your human resources operations with our comprehensive
              HR management platform. From employee records to payroll
              processing, we've got you covered.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/login"
                className="btn-primary flex items-center text-lg px-8 py-4"
              >
                Employee Login
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Complete HR Solution
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your workforce efficiently and
            effectively
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Employee Management",
              description:
                "Comprehensive digital 201 files with complete employee information, documents, and history tracking",
            },
            {
              icon: Calendar,
              title: "Leave Management",
              description:
                "Streamlined leave application process with approval workflows for vacation, sick, maternity, and emergency leave",
            },
            {
              icon: DollarSign,
              title: "Payroll System",
              description:
                "Automated payroll processing with semi-monthly schedules, deductions, and downloadable payslips",
            },
            {
              icon: Shield,
              title: "Role-Based Access",
              description:
                "Secure access control with different permission levels for executives, managers, HR, and employees",
            },
            {
              icon: Award,
              title: "Performance Management",
              description:
                "Goal setting, KPI tracking, appraisal cycles, and 360-degree feedback system",
            },
            {
              icon: TrendingUp,
              title: "Analytics & Reports",
              description:
                "Comprehensive HR metrics, turnover analysis, and exportable reports for decision making",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="card hover:shadow-lg transition-all duration-300 p-6 bg-white rounded-lg"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Compliance Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Security & Compliance First
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Built with enterprise-grade security and Philippine labor law
              compliance in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Authentication",
                description:
                  "Employee ID-based login with session management and IP restrictions",
              },
              {
                icon: Clock,
                title: "Audit Trails",
                description:
                  "Complete logging of all system activities and sensitive changes",
              },
              {
                icon: CheckCircle,
                title: "Labor Law Compliance",
                description:
                  "Built-in compliance with Philippine SSS, PhilHealth, and Pag-IBIG requirements",
              },
              {
                icon: Users,
                title: "Data Privacy",
                description:
                  "GDPR-compliant data handling and employee information protection",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center bg-white bg-opacity-20 rounded-lg p-6"
              >
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-blue-100 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Access your employee portal and manage your HR tasks efficiently
          </p>
          <Link
            to="/login"
            className="btn-primary text-lg px-8 py-4 inline-flex items-center"
          >
            Employee Login
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
