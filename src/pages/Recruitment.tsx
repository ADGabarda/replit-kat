import React, { useState } from "react";
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Plus,
  FileText,
  Upload,
  X,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import { useEmployee } from "../contexts/EmployeeContext";
import { useAuth } from "../contexts/AuthContext";

// Utility function to generate temporary password for new employees
const generateTempPassword = (): string => {
  const chars = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
  };

  const getRandomChar = (charset: string) =>
    charset[Math.floor(Math.random() * charset.length)];

  // Generate 6-character password with mixed case and numbers
  return Array.from({ length: 6 }, () => {
    const charSets = [chars.uppercase, chars.lowercase, chars.numbers];
    const randomSet = charSets[Math.floor(Math.random() * charSets.length)];
    return getRandomChar(randomSet);
  }).join("");
};

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  education: string;
  status:
    | "Viewed"
    | "To be interviewed"
    | "Interviewed"
    | "Processing approval"
    | "Approved";
  resume?: File | null;
  appliedDate: string;
  interviewDate?: string;
  interviewTime?: string;
  notes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  emergencyContactRelationship?: string;
}

interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  date: string;
  time: string;
  interviewer: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

const Recruitment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"candidates" | "interviews">(
    "candidates"
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [sameAsAddress, setSameAsAddress] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { addEmployee } = useEmployee();
  const { createUser } = useAuth();

  // Load candidates from localStorage
  const loadCandidates = (): Candidate[] => {
    const stored = localStorage.getItem("afflatus_candidates");
    if (stored) {
      return JSON.parse(stored);
    }
    // Return initial demo data if no stored data exists
    return [
      {
        id: "1",
        name: "Anna Marie Santos",
        email: "anna.santos@email.com",
        phone: "+63 917 123 4567",
        location: "Quezon City",
        experience: "5 years",
        education: "Bachelor of Business Administration",
        status: "To be interviewed",
        appliedDate: "2024-12-10",
        emergencyContactName: "Roberto Santos",
        emergencyContactPhone: "+63 917 765 4321",
        emergencyContactAddress: "Quezon City",
        emergencyContactRelationship: "Father",
      },
      {
        id: "2",
        name: "Michael John Reyes",
        email: "michael.reyes@email.com",
        phone: "+63 917 234 5678",
        location: "Makati City",
        experience: "3 years",
        education: "Bachelor of Marketing",
        status: "Viewed",
        appliedDate: "2024-12-08",
        emergencyContactName: "Sarah Reyes",
        emergencyContactPhone: "+63 917 876 5432",
        emergencyContactAddress: "Makati City",
        emergencyContactRelationship: "Spouse",
      },
    ];
  };

  const saveCandidates = (candidatesData: Candidate[]) => {
    localStorage.setItem("afflatus_candidates", JSON.stringify(candidatesData));
  };

  const [candidates, setCandidates] = useState<Candidate[]>(loadCandidates);

  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: "1",
      candidateId: "1",
      candidateName: "Anna Marie Santos",
      date: "2024-12-20",
      time: "10:00",
      interviewer: "Maria Santos Rodriguez",
      status: "Scheduled",
    },
  ]);

  const [newCandidate, setNewCandidate] = useState<Partial<Candidate>>({
    name: "",
    email: "",
    phone: "+63 ",
    location: "",
    experience: "",
    education: "",
    status: "Viewed",
    notes: "",
  });

  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    interviewer: "",
    notes: "",
  });

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // If it starts with 63, format as +63 XXX XXX XXXX
    if (digits.startsWith("63")) {
      const number = digits.substring(2);
      if (number.length <= 3) {
        return `+63 ${number}`;
      } else if (number.length <= 6) {
        return `+63 ${number.substring(0, 3)} ${number.substring(3)}`;
      } else {
        return `+63 ${number.substring(0, 3)} ${number.substring(
          3,
          6
        )} ${number.substring(6, 10)}`;
      }
    }

    // If it doesn't start with 63, assume it's a local number and add +63
    if (digits.length <= 3) {
      return `+63 ${digits}`;
    } else if (digits.length <= 6) {
      return `+63 ${digits.substring(0, 3)} ${digits.substring(3)}`;
    } else {
      return `+63 ${digits.substring(0, 3)} ${digits.substring(
        3,
        6
      )} ${digits.substring(6, 10)}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Processing approval":
        return "bg-blue-100 text-blue-800";
      case "Interviewed":
        return "bg-purple-100 text-purple-800";
      case "To be interviewed":
        return "bg-yellow-100 text-yellow-800";
      case "Viewed":
        return "bg-gray-100 text-gray-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate: Candidate = {
      id: Date.now().toString(),
      ...(newCandidate as Candidate),
      appliedDate: new Date().toISOString().split("T")[0],
    };
    const updatedCandidates = [...candidates, candidate];
    setCandidates(updatedCandidates);
    saveCandidates(updatedCandidates);
    setNewCandidate({
      name: "",
      email: "",
      phone: "+63 ",
      location: "",
      experience: "",
      education: "",
      status: "Viewed",
      notes: "",
    });
    setSameAsAddress(false);
    setShowAddModal(false);
  };

  const handleEditCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCandidate) {
      const updatedCandidates = candidates.map((c) =>
        c.id === editingCandidate.id ? editingCandidate : c
      );
      setCandidates(updatedCandidates);
      saveCandidates(updatedCandidates);
      setEditingCandidate(null);
      setShowEditModal(false);
      setSameAsAddress(false);
    }
  };

  const handleDeleteCandidate = (candidateId: string) => {
    const updatedCandidates = candidates.filter((c) => c.id !== candidateId);
    setCandidates(updatedCandidates);
    saveCandidates(updatedCandidates);
    setDeleteConfirm(null);
  };

  const handleStatusChange = async (
    candidateId: string,
    newStatus: Candidate["status"]
  ) => {
    const candidateToUpdate = candidates.find((c) => c.id === candidateId);
    if (!candidateToUpdate) return;

    // If approved, add to employees and create user account
    if (newStatus === "Approved") {
      try {
        // Add to Employee context
        const employeeData = {
          employeeId: `EMP${Date.now().toString().slice(-3).padStart(3, "0")}`,
          name: candidateToUpdate.name,
          role: "Employee",
          department: "New Hire",
          email: candidateToUpdate.email,
          phone: candidateToUpdate.phone,
          address: candidateToUpdate.location || "",
          birthdate: "",
          emergencyContact: {
            name: "",
            relationship: "",
            phone: "",
            address: "",
          },
          employmentType: "Probationary" as const,
          status: "Active" as const,
          hireDate: new Date().toISOString().split("T")[0],
          salary: 0,
          documents: candidateToUpdate.resume
            ? [
                {
                  id: Date.now().toString(),
                  name: candidateToUpdate.resume.name || "Resume",
                  type: "application/pdf",
                  uploadDate: new Date().toISOString(),
                  url: URL.createObjectURL(candidateToUpdate.resume),
                },
              ]
            : [],
        };

        addEmployee(employeeData);

        // Create user account using AuthContext
        const newUserData = {
          name: candidateToUpdate.name,
          role: "Employee" as const,
          department: "New Hire",
          email: candidateToUpdate.email,
          phone: candidateToUpdate.phone,
          address: candidateToUpdate.location || "",
          employmentType: "Probationary",
          emergencyContact: {
            name: "",
            relationship: "",
            phone: "",
            address: "",
          },
        };

        await createUser(newUserData);

        // Initialize leave balance for the new employee
        const leaveBalances = JSON.parse(
          localStorage.getItem("afflatus_leave_balances") || "[]"
        );
        const newBalance = {
          employeeId: employeeData.employeeId,
          vacation: 5,
          sick: 5,
          maternity: 0,
          emergency: 5,
          vacationUsed: 0,
          sickUsed: 0,
          emergencyUsed: 0,
          maternityUsed: 0,
        };
        leaveBalances.push(newBalance);
        localStorage.setItem(
          "afflatus_leave_balances",
          JSON.stringify(leaveBalances)
        );

        // Show detailed success notification
        alert(
          `✅ ${candidateToUpdate.name} has been successfully approved!\n\n` +
            `📋 Employee Record: Created (ID: ${employeeData.employeeId})\n` +
            `👤 User Account: Created\n` +
            `🏖️ Leave Balance: Initialized\n` +
            `📧 Login Credentials: Will be provided separately\n\n` +
            `The employee data has been transferred to:\n` +
            `• Employee Records Module\n` +
            `• User Management System\n` +
            `• Leave Management System`
        );
      } catch (error) {
        console.error("Error processing approved candidate:", error);
        alert(
          `❌ Error approving ${candidateToUpdate.name}. Please try again or contact IT support.`
        );
        return; // Don't change status if there was an error
      }
    }

    // Update the candidate status
    const updatedCandidates = candidates.map((candidate) =>
      candidate.id === candidateId
        ? { ...candidate, status: newStatus }
        : candidate
    );
    setCandidates(updatedCandidates);
    saveCandidates(updatedCandidates);
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidate) {
      const interview: Interview = {
        id: Date.now().toString(),
        candidateId: selectedCandidate.id,
        candidateName: selectedCandidate.name,
        ...interviewData,
        status: "Scheduled",
      };
      setInterviews([...interviews, interview]);

      // Update candidate status
      handleStatusChange(selectedCandidate.id, "To be interviewed");

      setInterviewData({ date: "", time: "", interviewer: "", notes: "" });
      setShowInterviewModal(false);
      setSelectedCandidate(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCandidate({ ...newCandidate, resume: file });
    }
  };

  const handlePhoneChange = (
    value: string,
    field: "phone" | "emergencyPhone"
  ) => {
    const formattedPhone = formatPhoneNumber(value);
    if (field === "phone") {
      setNewCandidate({ ...newCandidate, phone: formattedPhone });
    }
  };

  const handleEditPhoneChange = (
    value: string,
    field: "phone" | "emergencyPhone"
  ) => {
    if (editingCandidate) {
      const formattedPhone = formatPhoneNumber(value);
      if (field === "phone") {
        setEditingCandidate({ ...editingCandidate, phone: formattedPhone });
      }
    }
  };

  const handleSameAsAddressChange = (checked: boolean) => {
    setSameAsAddress(checked);
    if (checked && newCandidate.location) {
      // Copy address to emergency contact address (we'll add this field to the interface)
      setNewCandidate({
        ...newCandidate,
        emergencyContactAddress: newCandidate.location,
      });
    }
  };

  const filteredCandidates = candidates.filter(
    (candidate) => statusFilter === "all" || candidate.status === statusFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Recruitment & Hiring
          </h1>
          <p className="text-gray-600">Manage candidates and interviews</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Candidate
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">
                {candidates.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">To be Interviewed</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  candidates.filter((c) => c.status === "To be interviewed")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Scheduled Interviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter((i) => i.status === "Scheduled").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {candidates.filter((c) => c.status === "Approved").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: "candidates", name: "Candidates", icon: UserPlus },
              { id: "interviews", name: "Interviews", icon: Calendar },
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

        <div className="p-6">
          {/* Candidates Tab */}
          {activeTab === "candidates" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Candidates
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="Viewed">Viewed</option>
                      <option value="To be interviewed">
                        To be interviewed
                      </option>
                      <option value="Interviewed">Interviewed</option>
                      <option value="Processing approval">
                        Processing approval
                      </option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {candidate.name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              candidate.status
                            )}`}
                          >
                            {candidate.status}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">
                              <Mail className="w-4 h-4 inline mr-1" />
                              {candidate.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <Phone className="w-4 h-4 inline mr-1" />
                              {candidate.phone}
                            </p>
                            <p className="text-sm text-gray-600">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              {candidate.location}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <Briefcase className="w-4 h-4 inline mr-1" />
                              {candidate.experience} experience
                            </p>
                            <p className="text-sm text-gray-600">
                              <GraduationCap className="w-4 h-4 inline mr-1" />
                              {candidate.education}
                            </p>
                            {candidate.resume && (
                              <p className="text-sm text-green-600">
                                <FileText className="w-4 h-4 inline mr-1" />
                                Resume uploaded
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">
                          Applied:{" "}
                          {new Date(candidate.appliedDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <select
                          value={candidate.status}
                          onChange={(e) =>
                            handleStatusChange(
                              candidate.id,
                              e.target.value as Candidate["status"]
                            )
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Viewed">Viewed</option>
                          <option value="To be interviewed">
                            To be interviewed
                          </option>
                          <option value="Interviewed">Interviewed</option>
                          <option value="Processing approval">
                            Processing approval
                          </option>
                          <option value="Approved">Approved</option>
                        </select>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setShowInterviewModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Schedule Interview"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCandidate(candidate);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Edit Candidate"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {deleteConfirm === candidate.id ? (
                            <div className="flex space-x-1">
                              <button
                                onClick={() =>
                                  handleDeleteCandidate(candidate.id)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Confirm Delete"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(candidate.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete Candidate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interviews Tab */}
          {activeTab === "interviews" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Interview Schedule
                </h2>
              </div>

              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {interview.candidateName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              interview.status
                            )}`}
                          >
                            {interview.status}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(
                                interview.date
                              ).toLocaleDateString()} at {interview.time}
                            </p>
                            <p className="text-sm text-gray-600">
                              Interviewer: {interview.interviewer}
                            </p>
                          </div>
                          {interview.notes && (
                            <div>
                              <p className="text-sm text-gray-600">
                                Notes: {interview.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <select
                          value={interview.status}
                          onChange={(e) => {
                            setInterviews(
                              interviews.map((i) =>
                                i.id === interview.id
                                  ? {
                                      ...i,
                                      status: e.target
                                        .value as Interview["status"],
                                    }
                                  : i
                              )
                            );
                          }}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Candidate
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCandidate.name}
                    onChange={(e) =>
                      setNewCandidate({ ...newCandidate, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newCandidate.email}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        email: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCandidate.phone}
                    onChange={(e) => handlePhoneChange(e.target.value, "phone")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+63 XXX XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCandidate.location}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        location: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCandidate.experience}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        experience: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCandidate.education}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        education: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Upload
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                    {newCandidate.resume && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {newCandidate.resume.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Status
                </label>
                <select
                  value={newCandidate.status}
                  onChange={(e) =>
                    setNewCandidate({
                      ...newCandidate,
                      status: e.target.value as Candidate["status"],
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Viewed">Viewed</option>
                  <option value="To be interviewed">To be interviewed</option>
                  <option value="Interviewed">Interviewed</option>
                  <option value="Processing approval">
                    Processing approval
                  </option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Emergency Contact
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={newCandidate.emergencyContactName || ""}
                      onChange={(e) =>
                        setNewCandidate({
                          ...newCandidate,
                          emergencyContactName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship
                    </label>
                    <select
                      value={newCandidate.emergencyContactRelationship || ""}
                      onChange={(e) =>
                        setNewCandidate({
                          ...newCandidate,
                          emergencyContactRelationship: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Parent">Parent</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={newCandidate.emergencyContactPhone || "+63 "}
                      onChange={(e) =>
                        setNewCandidate({
                          ...newCandidate,
                          emergencyContactPhone: formatPhoneNumber(
                            e.target.value
                          ),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+63 XXX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Address
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sameAsAddress"
                          checked={sameAsAddress}
                          onChange={(e) => {
                            setSameAsAddress(e.target.checked);
                            if (e.target.checked) {
                              setNewCandidate({
                                ...newCandidate,
                                emergencyContactAddress: newCandidate.location,
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <label
                          htmlFor="sameAsAddress"
                          className="text-sm text-gray-700"
                        >
                          Same as candidate address
                        </label>
                      </div>
                      <input
                        type="text"
                        value={newCandidate.emergencyContactAddress || ""}
                        onChange={(e) =>
                          setNewCandidate({
                            ...newCandidate,
                            emergencyContactAddress: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sameAsAddress}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={newCandidate.notes}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, notes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about the candidate"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Candidate Modal */}
      {showEditModal && editingCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Candidate
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCandidate(null);
                  setSameAsAddress(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCandidate} className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCandidate.name}
                    onChange={(e) =>
                      setEditingCandidate({
                        ...editingCandidate,
                        name: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingCandidate.email}
                    onChange={(e) =>
                      setEditingCandidate({
                        ...editingCandidate,
                        email: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editingCandidate.phone}
                    onChange={(e) =>
                      handleEditPhoneChange(e.target.value, "phone")
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+63 XXX XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCandidate.location}
                    onChange={(e) =>
                      setEditingCandidate({
                        ...editingCandidate,
                        location: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCandidate.experience}
                    onChange={(e) =>
                      setEditingCandidate({
                        ...editingCandidate,
                        experience: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCandidate.education}
                    onChange={(e) =>
                      setEditingCandidate({
                        ...editingCandidate,
                        education: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingCandidate.status}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      status: e.target.value as Candidate["status"],
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Viewed">Viewed</option>
                  <option value="To be interviewed">To be interviewed</option>
                  <option value="Interviewed">Interviewed</option>
                  <option value="Processing approval">
                    Processing approval
                  </option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={editingCandidate.notes || ""}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      notes: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCandidate(null);
                    setSameAsAddress(false);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Schedule Interview
              </h2>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Scheduling interview for:{" "}
                  <span className="font-medium">{selectedCandidate.name}</span>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Date *
                </label>
                <input
                  type="date"
                  required
                  value={interviewData.date}
                  onChange={(e) =>
                    setInterviewData({ ...interviewData, date: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Time *
                </label>
                <input
                  type="time"
                  required
                  value={interviewData.time}
                  onChange={(e) =>
                    setInterviewData({ ...interviewData, time: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviewer *
                </label>
                <input
                  type="text"
                  required
                  value={interviewData.interviewer}
                  onChange={(e) =>
                    setInterviewData({
                      ...interviewData,
                      interviewer: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter interviewer name"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={interviewData.notes}
                  onChange={(e) =>
                    setInterviewData({
                      ...interviewData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Interview notes or special instructions"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
