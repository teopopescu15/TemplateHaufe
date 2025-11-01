import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#020617] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
              Welcome to the Dashboard!
            </h1>
            <p className="text-gray-600">You are successfully authenticated</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">User Information</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.display_name}</p>
              <p><strong>Email Verified:</strong> {user?.email_verified ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User ID:</strong> {user?.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
