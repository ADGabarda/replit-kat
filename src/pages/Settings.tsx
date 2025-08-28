import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Users, 
  Bell, 
  Shield,
  Database,
  Mail,
  Calendar,
  DollarSign,
  Save,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'notifications' | 'payroll' | 'leave'>('general');

  const settingsTabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'payroll', name: 'Payroll Settings', icon: DollarSign },
    { id: 'leave', name: 'Leave Policies', icon: Calendar }
  ];

  // Mock data for users
  const users = [
    {
      id: 1,
      name: 'Juan Carlos Dela Cruz',
      email: 'juan.delacruz@afflatus.com',
      role: 'President/CEO',
      status: 'Active',
      lastLogin: '2024-12-15'
    },
    {
      id: 2,
      name: 'Maria Santos Rodriguez',
      email: 'maria.santos@afflatus.com',
      role: 'HR',
      status: 'Active',
      lastLogin: '2024-12-15'
    },
    {
      id: 3,
      name: 'Roberto Miguel Fernandez',
      email: 'roberto.fernandez@afflatus.com',
      role: 'Employee',
      status: 'Active',
      lastLogin: '2024-12-14'
    }
  ];

  const leaveTypes = [
    { id: 1, name: 'Vacation Leave', days: 15, carryover: true, accrual: 'Monthly' },
    { id: 2, name: 'Sick Leave', days: 15, carryover: false, accrual: 'Yearly' },
    { id: 3, name: 'Maternity Leave', days: 105, carryover: false, accrual: 'As needed' },
    { id: 4, name: 'Emergency Leave', days: 5, carryover: false, accrual: 'Yearly' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure system preferences and policies</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Settings</h3>
            </div>
            <div className="card-body p-0">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 flex items-center hover:bg-gray-50 transition-colors ${
                      activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-gray-900">General Settings</h3>
              </div>
              <div className="card-body">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Company Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        defaultValue="Afflatus Realty Inc."
                      />
                    </div>
                    <div>
                      <label className="form-label">Company Email</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        defaultValue="hr@afflatus.com"
                      />
                    </div>
                    <div>
                      <label className="form-label">Time Zone</label>
                      <select className="form-input">
                        <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Date Format</label>
                      <select className="form-input">
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Company Address</label>
                    <textarea 
                      className="form-input" 
                      rows={3}
                      defaultValue="123 Business District, Makati City, Metro Manila, Philippines"
                    ></textarea>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Session Timeout (minutes)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        defaultValue="5"
                        min="1"
                        max="60"
                      />
                    </div>
                    <div>
                      <label className="form-label">Working Hours</label>
                      <select className="form-input">
                        <option value="8">8 hours</option>
                        <option value="9">9 hours</option>
                        <option value="10">10 hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && (
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">User Management</h3>
                <button className="btn-primary text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </button>
              </div>
              <div className="card-body">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="font-medium">{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className="status-active text-xs">
                              {user.status}
                            </span>
                          </td>
                          <td>{new Date(user.lastLogin).toLocaleDateString()}</td>
                          <td>
                            <div className="flex space-x-2">
                              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-gray-900">Notification Settings</h3>
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      {[
                        'Leave request submissions',
                        'Leave request approvals',
                        'Payroll processing',
                        'Employee birthdays',
                        'System maintenance'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{item}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">System Notifications</h4>
                    <div className="space-y-3">
                      {[
                        'Login alerts',
                        'Failed login attempts',
                        'Data backup status',
                        'System updates'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{item}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="btn-primary">
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payroll Settings */}
          {activeTab === 'payroll' && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-gray-900">Payroll Configuration</h3>
              </div>
              <div className="card-body">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Pay Frequency</label>
                      <select className="form-input">
                        <option value="semi-monthly">Semi-monthly (15th & 30th)</option>
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Currency</label>
                      <select className="form-input">
                        <option value="PHP">Philippine Peso (₱)</option>
                        <option value="USD">US Dollar ($)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Tax Rates</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">SSS Rate (%)</label>
                        <input type="number" className="form-input" defaultValue="11" step="0.1" />
                      </div>
                      <div>
                        <label className="form-label">PhilHealth Rate (%)</label>
                        <input type="number" className="form-input" defaultValue="2.75" step="0.1" />
                      </div>
                      <div>
                        <label className="form-label">Pag-IBIG Rate (%)</label>
                        <input type="number" className="form-input" defaultValue="2" step="0.1" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Overtime Settings</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Regular Overtime Rate</label>
                        <input type="number" className="form-input" defaultValue="1.25" step="0.1" />
                      </div>
                      <div>
                        <label className="form-label">Holiday Overtime Rate</label>
                        <input type="number" className="form-input" defaultValue="2.0" step="0.1" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary">
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Leave Policies */}
          {activeTab === 'leave' && (
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Leave Policies</h3>
                <button className="btn-primary text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Leave Type
                </button>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {leaveTypes.map((leave) => (
                    <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{leave.name}</h4>
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Days per year:</span> {leave.days}
                            </div>
                            <div>
                              <span className="font-medium">Carryover:</span> {leave.carryover ? 'Yes' : 'No'}
                            </div>
                            <div>
                              <span className="font-medium">Accrual:</span> {leave.accrual}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Leave Approval Workflow</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span className="text-gray-700">Require manager approval for all leave requests</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span className="text-gray-700">Require HR approval for leave requests over 5 days</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span className="text-gray-700">Allow employees to cancel approved leave requests</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button className="btn-primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Policies
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;