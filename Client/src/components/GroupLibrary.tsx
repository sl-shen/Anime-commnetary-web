
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Group {
  id: number;
  name: string;
  description: string;
}

const GroupLibrary: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/groups/get', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
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
      fetchGroups();
    } catch (error) {
      console.error('Failed to create group', error);
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
        console.error('Failed to delete group', error);
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
      <h1 className="text-2xl font-bold mb-4">Group Library</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (newGroupName.trim() === '') {
            alert('Group name cannot be empty');
            return;
        }
        createGroup(e);
        }} className="mb-4">
        <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group Name"
            className="mr-2 p-2 border rounded"
        />
        <input
          type="text"
          value={newGroupDescription}
          onChange={(e) => setNewGroupDescription(e.target.value)}
          placeholder="Group Description"
          className="mr-2 p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Create Group</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => (
          <div key={group.id} className="border p-4 rounded">
            <h2 className="text-xl font-bold">{group.name}</h2>
            <p>{group.description}</p>
            <div className="mt-2">
              <Link to={`/groups/${group.id}`} className="text-blue-500 mr-2">View</Link>
              <button onClick={() => deleteGroup(group.id)} className="text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupLibrary;