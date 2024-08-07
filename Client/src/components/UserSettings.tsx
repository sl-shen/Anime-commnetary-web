import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  username: string;
  email: string;
}

const UserSettings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setNewUsername(response.data.username);
    } catch (error) {
      console.error('Failed to fetch user info', error);
      setError('Failed to load user information');
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8000/update', 
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(prevUser => prevUser ? { ...prevUser, username: newUsername } : null);
      setIsEditing(false);
      setSuccessMessage('Username updated successfully');
    } catch (error) {
      console.error('Failed to update username', error);
      setError('Failed to update username. Please try again.');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <p className="text-gray-700">{user.email}</p>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                value={newUsername}
                onChange={handleUsernameChange}
              />
              <div className="flex items-center justify-between mt-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Save
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setNewUsername(user.username);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-700">{user.username}</p>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;