import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { isAuthenticated} = useAuth();

  return (
    <div className="fixed top-0 left-0 h-full w-38 bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold">KKSK</h1>
      </div>
      <nav className="mt-8">
        {isAuthenticated ? (
          <>
            <Link to="/home" className="block py-2 px-4 hover:bg-gray-700 transition duration-150">Home</Link>
            <Link to="/library" className="block py-2 px-4 hover:bg-gray-700 transition duration-150">Library</Link>
            <Link to="/settings" className="block py-2 px-4 hover:bg-gray-700 transition duration-150">Settings</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="block py-2 px-4 hover:bg-gray-700 transition duration-150">Login</Link>
            <Link to="/register" className="block py-2 px-4 hover:bg-gray-700 transition duration-150">Register</Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;