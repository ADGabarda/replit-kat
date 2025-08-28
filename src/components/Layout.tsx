import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Building2,
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Award,
  UserPlus,
  GraduationCap,
  FileText,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["all"],
    },
    {
      name: "User Management",
      href: "/user-management",
      icon: Users,
      roles: ["Master Admin", "IT Head"],
    },
    {
      name: "Employees",
      href: "/employees",
      icon: Users,
      roles: [
        "Master Admin",
        "President/CEO",
        "Vice President",
        "IT Head",
        "HR",
        "Admin",
      ],
    },
    {
      name: "Leave Management",
      href: "/leave",
      icon: Calendar,
      roles: ["all"],
    },
    { name: "Attendance", href: "/attendance", icon: Clock, roles: ["all"] },
    {
      name: "Payroll",
      href: "/payroll",
      icon: DollarSign,
      roles: [
        "Master Admin",
        "President/CEO",
        "Vice President",
        "IT Head",
        "HR",
        "Admin",
        "Employee"
      ],
    },
    { name: "Calendar", href: "/calendar", icon: Calendar, roles: ["all"] },
    { name: "Performance", href: "/performance", icon: Award, roles: ["all"] },
    {
      name: "Recruitment",
      href: "/recruitment",
      icon: UserPlus,
      roles: [
        "Master Admin",
        "President/CEO",
        "Vice President",
        "IT Head",
        "HR",
        "Admin",
      ],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      roles: [
        "Master Admin",
        "President/CEO",
        "Vice President",
        "IT Head",
        "HR",
        "Admin",
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const canAccess = (roles: string[]) => {
    if (roles.includes("all")) return true;
    return user?.role && roles.includes(user.role);
  };
  const filteredNavigation = navigation.filter((item) => canAccess(item.roles));

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - FIXED */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Header - FIXED with better responsive design */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0">
              <img
                src="/logo-only.jpg"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="ml-2 min-w-0">
              <div className="text-lg font-bold text-gray-900 truncate">
                Afflatus Realty
              </div>
              <div className="text-xs text-gray-500">HR System</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
            aria-label="Close sidebar"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - FIXED with proper text handling */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => {
                  setSidebarOpen(false);
                  setProfileMenuOpen(false);
                }}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Open sidebar"
              type="button"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="hidden lg:block min-w-0">
                <h1 className="text-2xl font-semibold text-gray-900 truncate">
                  {navigation.find((item) => isActive(item.href))?.name ||
                    "Dashboard"}
                </h1>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                    type="button"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.role}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                      {(() => {
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
                          <span className="text-white font-medium text-sm">
                            {user.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        );
                      })()}
                    </div>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        type="button"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
