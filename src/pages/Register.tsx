import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateCredentials } from '../lib/passwordGenerator';
import { MessageSquare, User, Lock, Eye, EyeOff, UserPlus, Shield } from 'lucide-react';

const Register: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect non-admins (but allow loading state)
  if (user !== null && (!user || user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">Only administrators can create new accounts.</p>
            <div className="mt-6">
              <Link
                to="/login"
                className="bg-[#38b6ff] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2da5ef] transition-all"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [generatedCredentials, setGeneratedCredentials] = useState<{username: string, password: string} | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { createUser, isLoading } = useAuth();
  const navigate = useNavigate();

  // Show loading while checking auth
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38b6ff]"></div>
      </div>
    );
  }

  const handleGenerateCredentials = () => {
    if (!name.trim()) {
      setError('Please enter a full name first');
      return;
    }
    
    const credentials = generateCredentials(name, role);
    setGeneratedCredentials(credentials);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!generatedCredentials) {
      setError('Please generate credentials first');
      return;
    }

    try {
      await createUser(generatedCredentials.username, generatedCredentials.password, name, role);
      setSuccess(`${role === 'admin' ? 'Administrator' : 'User'} account created successfully!`);
      setName('');
      setGeneratedCredentials(null);
      setRole('user');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Cuptolyo" className="w-80 h-20 object-contain mb-2" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create New Account</h2>
          <p className="mt-2 text-gray-600">Add a new administrator or user account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">Regular User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  onChange={(e) => {
                    setName(e.target.value);
                    setGeneratedCredentials(null); // Reset credentials when name changes
                  }}
                />
              </div>
            </div>

            {/* Generate Credentials Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleGenerateCredentials}
                disabled={!name.trim()}
                className="bg-gradient-to-r from-[#38b6ff] to-[#2da5ef] text-white px-6 py-3 rounded-lg font-medium hover:from-[#2da5ef] hover:to-[#1e94d4] focus:outline-none focus:ring-2 focus:ring-[#38b6ff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Generate Credentials
              </button>
            </div>

            {/* Generated Credentials Display */}
            {generatedCredentials && (
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-green-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Generated Credentials</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Username:</span>
                    <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                      {generatedCredentials.username}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Password:</span>
                    <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                      {generatedCredentials.password}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {role === 'admin' 
                      ? '🔒 Admin pattern: ADM + 3 chars (uppercase, numbers, special)'
                      : '👤 User pattern: usr + 3 chars (lowercase, numbers)'
                    }
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !generatedCredentials}
              className="w-full bg-gradient-to-r from-[#38b6ff] to-[#2da5ef] text-white py-3 rounded-lg font-medium hover:from-[#2da5ef] hover:to-[#1e94d4] focus:outline-none focus:ring-2 focus:ring-[#38b6ff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating {role} account...
                </div>
              ) : (
                `Create ${role === 'admin' ? 'Administrator' : 'User'} Account`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;