import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePerformance } from "../contexts/PerformanceContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Edit,
  Save,
  Camera,
  Shield,
  Clock,
  Award,
  FileText,
} from "lucide-react";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "personal" | "employment" | "emergency"
  >("personal");
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    const stored = localStorage.getItem(`profile_image_${user?.id}`);
    return stored || null;
  });
  const [showImageUpload, setShowImageUpload] = useState(false);

  if (!user) return null;

  // Get performance data
  let performanceScore = 0;
  try {
    const { getEmployeeAverageScore } = usePerformance();
    performanceScore = getEmployeeAverageScore(user.id);
  } catch (error) {
    console.log("Performance context not available");
  }

  // Calculate years of service based on hire date
  const calculateYearsOfService = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hire.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    return diffYears;
  };

  // Get documents count (from localStorage or context)
  const getDocumentsCount = () => {
    const docs = localStorage.getItem(`employee_documents_${user.id}`);
    return docs ? JSON.parse(docs).length : 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="card mb-8">
        <div className="card-body">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowImageUpload(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                title="Change Profile Picture"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  <p className="text-lg text-gray-600">{user.role}</p>
                  <p className="text-sm text-gray-500">
                    Employee ID: {user.employeeId}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="status-active text-xs">{user.status}</span>
                    <span className="text-xs text-gray-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Joined {new Date(user.hireDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  Profile editing is managed through User Management
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-grid mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Years of Service</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculateYearsOfService(user.hireDate)}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Leave Balance</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
              <p className="text-xs text-gray-500">days remaining</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceScore > 0 ? performanceScore.toFixed(1) : "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                {performanceScore > 0 ? "out of 5.0" : "No ratings yet"}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {getDocumentsCount()}
              </p>
              <p className="text-xs text-gray-500">uploaded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: "personal", name: "Personal Information", icon: User },
              { id: "employment", name: "Employment Details", icon: Briefcase },
              { id: "emergency", name: "Emergency Contact", icon: Shield },
              { id: "documents", name: "Documents", icon: FileText },
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

        <div className="card-body">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Personal Information
              </h3>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      defaultValue={user.name}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      className="form-input"
                      defaultValue={user.employeeId}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      defaultValue={user.email}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      defaultValue={user.phone}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      defaultValue="1990-01-15"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select className="form-input" disabled={!isEditing}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    defaultValue={user.address}
                    disabled={!isEditing}
                  ></textarea>
                </div>
              </form>
            </div>
          )}

          {/* Employment Details Tab */}
          {activeTab === "employment" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Employment Details
              </h3>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      className="form-input"
                      defaultValue={user.role}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      defaultValue={user.department}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="form-label">Employment Type</label>
                    <input
                      type="text"
                      className="form-input"
                      defaultValue={user.employmentType}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="form-label">Employment Status</label>
                    <input
                      type="text"
                      className="form-input"
                      defaultValue={user.status}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="form-label">Hire Date</label>
                    <input
                      type="date"
                      className="form-input"
                      defaultValue={user.hireDate}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="form-label">Manager</label>
                    <input
                      type="text"
                      className="form-input"
                      defaultValue="Maria Santos Rodriguez"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Work Schedule
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Start Time</label>
                      <input
                        type="time"
                        className="form-input"
                        defaultValue="09:00"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="form-label">End Time</label>
                      <input
                        type="time"
                        className="form-input"
                        defaultValue="18:00"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="form-label">Work Days</label>
                      <input
                        type="text"
                        className="form-input"
                        defaultValue="Monday - Friday"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === "emergency" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Emergency Contact
              </h3>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      className="form-input"
                      defaultValue={user.emergencyContact.name}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="form-label">Relationship</label>
                    <select className="form-input" disabled={!isEditing}>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      defaultValue={user.emergencyContact.phone}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      defaultValue="emergency@example.com"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    defaultValue={user.emergencyContact.address}
                    disabled={!isEditing}
                  ></textarea>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <Shield className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Important Note
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This information will only be used in case of
                        emergencies. Please ensure all details are accurate and
                        up to date.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Documents
              </h3>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload documents</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && user) {
                        const files = Array.from(e.target.files);
                        const existingDocs = JSON.parse(
                          localStorage.getItem(
                            `employee_documents_${user.id}`
                          ) || "[]"
                        );

                        files.forEach((file) => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const newDoc = {
                              id:
                                Date.now().toString() +
                                Math.random().toString(36).substr(2, 9),
                              name: file.name,
                              type: file.type,
                              size: file.size,
                              uploadDate: new Date().toISOString(),
                              data: event.target?.result,
                            };
                            existingDocs.push(newDoc);
                            localStorage.setItem(
                              `employee_documents_${user.id}`,
                              JSON.stringify(existingDocs)
                            );
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="btn-primary cursor-pointer inline-block"
                  >
                    Choose Files
                  </label>
                </div>

                <div className="space-y-2">
                  {(() => {
                    const docs = JSON.parse(
                      localStorage.getItem(`employee_documents_${user.id}`) ||
                        "[]"
                    );
                    return docs.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Uploaded{" "}
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedDocs = docs.filter(
                              (d: any) => d.id !== doc.id
                            );
                            localStorage.setItem(
                              `employee_documents_${user.id}`,
                              JSON.stringify(updatedDocs)
                            );
                            window.location.reload(); // Simple refresh to update the view
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showImageUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Upload Profile Picture
            </h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setProfileImage(event.target?.result as string);
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }
              }}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowImageUpload(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (profileImage && user) {
                    localStorage.setItem(
                      `profile_image_${user.id}`,
                      profileImage
                    );
                    // Update the user's profile image in the auth context
                    const currentUser = JSON.parse(
                      localStorage.getItem("hr_user") || "{}"
                    );
                    currentUser.profileImage = profileImage;
                    localStorage.setItem(
                      "hr_user",
                      JSON.stringify(currentUser)
                    );
                  }
                  setShowImageUpload(false);
                }}
                className="btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
