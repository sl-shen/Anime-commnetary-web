import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUsers, FaPlus, FaSync, FaTrash, FaEye } from 'react-icons/fa';

interface Group {
  id: number;
  name: string;
  description: string;
  owner_name: string;
}

const GroupLibrary: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/groups/get', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (error) {
      //console.error('Failed to fetch groups', error);
      alert('Failed to load groups. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim() === '') {
      alert('Group name cannot be empty');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/groups/create', {
        name: newGroupName,
        description: newGroupDescription
      }, 
      {headers: { Authorization: `Bearer ${token}` }}
    );
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateForm(false);
      fetchGroups();
    } catch (error) {
      //console.error('Failed to create group', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const deleteGroup = async (groupId: number) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchGroups();
      } catch (error) {
        //console.error('Failed to delete group', error);
        if (axios.isAxiosError(error) && error.response) {
          alert(error.response.data.detail || 'Failed to delete group');
        } else {
          alert('An unexpected error occurred');
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Group Library</h1>
            <p className="text-lg mb-4">Manage and explore your groups</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end mb-2">
              <FaUsers className="mr-2" />
              <span>{groups.length} Groups</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-white text-purple-600 rounded hover:bg-purple-100 transition duration-300 flex items-center"
          >
            <FaPlus className="mr-2" />
            {showCreateForm ? 'Cancel' : 'Create New Group'}
          </button>
          <button
            onClick={fetchGroups}
            className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-100 transition duration-300 flex items-center"
            disabled={isLoading}
          >
            <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>


      {showCreateForm && (
        <form onSubmit={createGroup} className="mb-6 bg-white p-6 rounded-lg shadow">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group Name"
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            placeholder="Group Description"
            className="w-full p-2 border rounded mb-2"
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300">Create Group</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => (
          <div key={group.id} className="bg-white p-6 rounded-lg shadow flex flex-col h-full">
            <div className="flex-grow">
              <h2 className="text-2xl font-bold mb-2">{group.name}</h2>
              <p className="mb-4 text-gray-600">{group.description}</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <Link to={`/groups/${group.id}`} className="text-blue-500 mr-4 flex items-center">
                  <FaEye className="mr-1" /> View
                </Link>
                <button onClick={() => deleteGroup(group.id)} className="text-red-500 flex items-center">
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
              <p className="text-sm text-gray-500">Created by: {group.owner_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupLibrary;