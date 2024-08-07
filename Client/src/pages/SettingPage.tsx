import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Setting from '../components/UserSettings';
import { FaCog, FaSignOutAlt } from 'react-icons/fa';

const Settings: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <FaCog className="text-3xl text-blue-500 mr-4" />
            <h1 className="text-3xl font-bold text-gray-800">用户设置</h1>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <Setting />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
          >
            <FaSignOutAlt className="mr-2" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;