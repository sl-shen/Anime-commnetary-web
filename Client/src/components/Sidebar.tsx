import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <button
        className="absolute top-4 right-4 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '×' : '☰'}
      </button>
      <nav className="mt-16">
        {isAuthenticated ? (
          <>
            <Link to="/home" className="block py-2 px-4 hover:bg-gray-700">Home</Link>
            <Link to="/library" className="block py-2 px-4 hover:bg-gray-700">Library</Link>
            <Link to="/settings" className="block py-2 px-4 hover:bg-gray-700">Settings</Link>
            <button onClick={logout} className="block w-full text-left py-2 px-4 hover:bg-gray-700">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="block py-2 px-4 hover:bg-gray-700">Login</Link>
            <Link to="/register" className="block py-2 px-4 hover:bg-gray-700">Register</Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
