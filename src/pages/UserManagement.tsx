import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  UserCheck,
  Key,
  Copy,
  Check,
} from "lucide-react";

interface User {
  id: string;
  employeeId: string;
  name: string;
  role:
    | "Master Admin"
    | "President/CEO"
    | "Vice President"
    | "IT Head"
    | "HR"
    | "Admin"
    | "Employee"
    | "Intern";
  department: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };
  employmentType: string;
  status: string;
  hireDate: string;
  createdBy?: string;
  createdAt?: string;
  generatedPassword?: string;
}

const UserManagement: React.FC = () => {
  const {
    user: currentUser,
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    isLoading,
  } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [copiedPasswords, setCopiedPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [newUser, setNewUser] = useState({
    name: "",
    role: "Employee" as User["role"],
    department: "",
    email: "",
    phone: "",
    address: "",
    employmentType: "Regular",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
      address: "",
    },
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  React.useEffect(() => {
    if (
      currentUser?.role === "Master Admin" ||
      currentUser?.role === "IT Head"
    ) {
      try {
        const allUsers = getAllUsers();
        setUsers(allUsers);
      } catch (err) {
        setError("Failed to load users");
      }
    }
  }, [currentUser, getAllUsers]);

  const roles = [
    "President/CEO",
    "Vice President",
    "IT Head",
    "HR",
    "Employee",
    "Intern",
  ];

  const departments = [
    "Executive",
    "Human Resources",
    "Information Technology",
    "Sales",
    "Marketing",
    "Operations",
    "Finance",
    "Legal",
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const createdUser = await createUser(newUser);
      setUsers((prev) => [...prev, createdUser]);
      setSuccess(
        `User created successfully! Employee ID: ${
          createdUser.employeeId
        }, Password: ${(createdUser as any).generatedPassword}`
      );
      setNewUser({
        name: "",
        role: "Employee",
        department: "",
        email: "",
        phone: "",
        address: "",
        employmentType: "Regular",
        emergencyContact: {
          name: "",
          relationship: "",
          phone: "",
          address: "",
        },
      });
      setShowCreateForm(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSuccess("User deleted successfully");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err) {
      setError((err as Error).message);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setError("");
    setSuccess("");

    try {
      await updateUser(editingUser.id, editingUser);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? editingUser : u))
      );
      setSuccess("User updated successfully");
      setShowEditForm(false);
      setEditingUser(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyPassword = async (password: string, userId: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPasswords((prev) => ({ ...prev, [userId]: true }));
      setTimeout(() => {
        setCopiedPasswords((prev) => ({ ...prev, [userId]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy password");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Master Admin":
        return "bg-red-100 text-red-800";
      case "President/CEO":
        return "bg-purple-100 text-purple-800";
      case "Vice President":
        return "bg-indigo-100 text-indigo-800";
      case "IT Head":
        return "bg-blue-100 text-blue-800";
      case "HR":
        return "bg-green-100 text-green-800";

      case "Employee":
        return "bg-gray-100 text-gray-800";
      case "Intern":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Master Admin":
        return <Shield className="w-4 h-4" />;
      case "President/CEO":
        return <Shield className="w-4 h-4" />;
      case "Vice President":
        return <UserCheck className="w-4 h-4" />;
      case "IT Head":
        return <User className="w-4 h-4" />;
      case "HR":
        return <User className="w-4 h-4" />;

      case "Employee":
        return <User className="w-4 h-4" />;
      case "Intern":
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Create and manage user accounts across the organization
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.status === "Active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Administrators</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  users.filter((u) =>
                    [
                      "Master Admin",
                      "President/CEO",
                      "Vice President",
                      "IT Head",
                      "HR",
                    ].includes(u.role)
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Building className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(users.map((u) => u.department)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-8">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              {/* Search icon with adjusted positioning */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

              {/* Input with increased left padding to prevent overlap */}
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">All Roles</option>
                <option value="Master Admin">Master Admin</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">System Users</h2>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Credentials</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {user.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-1" />
                        {user.department}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-1" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">ID:</span>{" "}
                          {user.employeeId}
                        </div>
                        {(user as any).generatedPassword && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              Password:
                            </span>
                            <div className="flex items-center space-x-1">
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                {showPassword[user.id]
                                  ? (user as any).generatedPassword
                                  : "••••••••"}
                              </code>
                              <button
                                onClick={() =>
                                  togglePasswordVisibility(user.id)
                                }
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword[user.id] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  copyPassword(
                                    (user as any).generatedPassword,
                                    user.id
                                  )
                                }
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                {copiedPasswords[user.id] ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        {(currentUser?.role === "Master Admin" ||
                          currentUser?.role === "IT Head") && (
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {(currentUser?.role === "Master Admin" ||
                          currentUser?.role === "IT Head") &&
                          user.role !== "Master Admin" && (
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        {currentUser?.role !== "Master Admin" &&
                          currentUser?.role !== "IT Head" && (
                            <div className="text-sm text-gray-400 px-2 py-1">
                              Admin Only
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New User
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        role: e.target.value as User["role"],
                      }))
                    }
                    className="form-input"
                    required
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Department *</label>
                  <select
                    value={newUser.department}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className="form-input"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Employment Type *</label>
                  <select
                    value={newUser.employmentType}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        employmentType: e.target.value,
                      }))
                    }
                    className="form-input"
                    required
                  >
                    <option value="Regular">Regular</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Contractual">Contractual</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Address *</label>
                <textarea
                  value={newUser.address}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="form-input"
                  rows={3}
                  required
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Emergency Contact
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Contact Name *</label>
                    <input
                      type="text"
                      value={newUser.emergencyContact.name}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            name: e.target.value,
                          },
                        }))
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Relationship *</label>
                    <select
                      value={newUser.emergencyContact.relationship}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            relationship: e.target.value,
                          },
                        }))
                      }
                      className="form-input"
                      required
                    >
                      <option value="">Select Relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Contact Phone *</label>
                    <input
                      type="tel"
                      value={newUser.emergencyContact.phone}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            phone: e.target.value,
                          },
                        }))
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Address *</label>
                    <input
                      type="text"
                      value={newUser.emergencyContact.address}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            address: e.target.value,
                          },
                        }))
                      }
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditForm && editingUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditUser} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Role *</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev
                          ? { ...prev, role: e.target.value as User["role"] }
                          : null
                      )
                    }
                    className="form-input"
                    required
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Department *</label>
                  <select
                    value={editingUser.department}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, department: e.target.value } : null
                      )
                    }
                    className="form-input"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Employment Type *</label>
                  <select
                    value={editingUser.employmentType}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev
                          ? { ...prev, employmentType: e.target.value }
                          : null
                      )
                    }
                    className="form-input"
                    required
                  >
                    <option value="Regular">Regular</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Contractual">Contractual</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, email: e.target.value } : null
                      )
                    }
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, phone: e.target.value } : null
                      )
                    }
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Status *</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, status: e.target.value } : null
                      )
                    }
                    className="form-input"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Address *</label>
                <textarea
                  value={editingUser.address}
                  onChange={(e) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, address: e.target.value } : null
                    )
                  }
                  className="form-input"
                  rows={3}
                  required
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Emergency Contact
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Contact Name *</label>
                    <input
                      type="text"
                      value={editingUser.emergencyContact.name}
                      onChange={(e) =>
                        setEditingUser((prev) =>
                          prev
                            ? {
                                ...prev,
                                emergencyContact: {
                                  ...prev.emergencyContact,
                                  name: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Relationship *</label>
                    <select
                      value={editingUser.emergencyContact.relationship}
                      onChange={(e) =>
                        setEditingUser((prev) =>
                          prev
                            ? {
                                ...prev,
                                emergencyContact: {
                                  ...prev.emergencyContact,
                                  relationship: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      className="form-input"
                      required
                    >
                      <option value="">Select Relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Contact Phone *</label>
                    <input
                      type="tel"
                      value={editingUser.emergencyContact.phone}
                      onChange={(e) =>
                        setEditingUser((prev) =>
                          prev
                            ? {
                                ...prev,
                                emergencyContact: {
                                  ...prev.emergencyContact,
                                  phone: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Address *</label>
                    <input
                      type="text"
                      value={editingUser.emergencyContact.address}
                      onChange={(e) =>
                        setEditingUser((prev) =>
                          prev
                            ? {
                                ...prev,
                                emergencyContact: {
                                  ...prev.emergencyContact,
                                  address: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingUser(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? "Updating..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete User
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm mb-2">
                  <strong>You are about to delete:</strong>
                </p>
                <div className="text-red-700 text-sm">
                  <p>
                    <strong>Name:</strong> {userToDelete.name}
                  </p>
                  <p>
                    <strong>Employee ID:</strong> {userToDelete.employeeId}
                  </p>
                  <p>
                    <strong>Role:</strong> {userToDelete.role}
                  </p>
                  <p>
                    <strong>Department:</strong> {userToDelete.department}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                This will permanently remove the user from the system. All their
                access will be revoked immediately.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
