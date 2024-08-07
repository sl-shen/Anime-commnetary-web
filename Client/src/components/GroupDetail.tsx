import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import MediaList from '../components/MediaList';
import GroupMediaSearch from '../components/GroupMediaSearch';
import { FaUsers, FaBook, FaFilm, FaMusic, FaGamepad, FaUser } from 'react-icons/fa';

interface Media {
  id: number;
  title: string;
  image: string;
  media_type: number;
}

interface Member {
  id: number;
  username: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  owner_name: string;
}

const mediaTypes = [
  { id: 0, name: "全部" },
  { id: 1, name: "书籍" },
  { id: 2, name: "动画" },
  { id: 3, name: "音乐" },
  { id: 4, name: "游戏" },
  { id: 6, name: "真人" }
];

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<Media[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTag, setActiveTag] = useState(0);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [groupInfo, setGroupInfo] = useState<Group | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const groupResponse = await axios.get(`http://localhost:8000/groups/${id}`, { headers });
      setGroupInfo(groupResponse.data);

      const mediaResponse = await axios.get(`http://localhost:8000/groups/${id}/media`, { headers });
      setMedia(mediaResponse.data);
      setFilteredMedia(mediaResponse.data);

      const membersResponse = await axios.get(`http://localhost:8000/groups/${id}/members`, { headers });
      setMembers(membersResponse.data);
    } catch (error) {
      //console.error('Failed to fetch group details', error);
      alert('Failed to load group details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTag === 0) {
      setFilteredMedia(media);
    } else {
      setFilteredMedia(media.filter(item => item.media_type === activeTag));
    }
  }, [activeTag, media]);

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/groups/${id}/invite`,
        { username: newMemberUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMemberUsername('');
      fetchGroupDetails();
    } catch (error: unknown) {
      //console.error('Failed to add member', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.status === 404) {
          alert('User not found. Please check the username and try again.'); 
        } else if (axiosError.response && axiosError.response.status === 400) {
          alert('User already in the group.');
        } else if (axiosError.response && axiosError.response.status === 403) {
          alert('Only the group creator can add members.');
        } else {
          alert('Failed to add member. Please try again.');
        }
      } else {
        alert('An unknown error occurred. Please try again.');
      }
    }
  };

  const removeMember = async (memberId: number) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/groups/${id}/members/${memberId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchGroupDetails();
      } catch (error: unknown) {
        //console.error('Failed to remove member', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            alert('Only the group creator can remove members.');
          } else {
            alert('Failed to remove member. Please try again.');
          }
        } else {
          alert('An unexpected error occurred. Please try again.');
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {groupInfo && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{groupInfo.name}</h1>
              <p className="text-lg mb-4">{groupInfo.description}</p>
              <div className="flex items-center">
                <FaUser className="mr-2" />
                <span>Created by: {groupInfo.owner_name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end mb-2">
                <FaUsers className="mr-2" />
                <span>{members.length+1} Members</span>
              </div>
              <div className="flex space-x-2">
                <FaBook className="text-yellow-300" />
                <FaFilm className="text-red-300" />
                <FaMusic className="text-green-300" />
                <FaGamepad className="text-blue-300" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-100 transition duration-300"
            >
              Manage Members
            </button>
            <button
              onClick={() => setIsSearching(!isSearching)}
              className="px-4 py-2 bg-white text-purple-600 rounded hover:bg-purple-100 transition duration-300"
            >
              {isSearching ? 'Back to Library' : 'Add New Media'}
            </button>
          </div>
        </div>
      )}



      {!isSearching && (
        <div className="flex space-x-2 mb-4">
          {mediaTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveTag(type.id)}
              className={`px-4 py-2 rounded ${
                activeTag === type.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      )}

      {isSearching ? (
        <GroupMediaSearch onAddMedia={fetchGroupDetails} />
      ) : (
        <MediaList media={filteredMedia} isGroupMedia={true}/>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Manage Members</h3>
            <form onSubmit={addMember} className="mb-4">
              <input
                type="text"
                value={newMemberUsername}
                onChange={(e) => setNewMemberUsername(e.target.value)}
                placeholder="Username"
                className="w-full p-2 border rounded mb-2"
              />
              <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Add Member
              </button>
            </form>
            <ul className="max-h-60 overflow-y-auto">
              {members.map(member => (
                <li key={member.id} className="flex justify-between items-center mb-2">
                  <span>{member.username}</span>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowMemberModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;