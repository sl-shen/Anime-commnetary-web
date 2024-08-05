import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios, { AxiosError }  from 'axios';
import MediaList from '../components/MediaList';
import GroupMediaSearch from '../components/GroupMediaSearch';

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
  const [error, setError] = useState('');
  const [activeTag, setActiveTag] = useState(0);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [newMemberUsername, setNewMemberUsername] = useState('');

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const mediaResponse = await axios.get(`http://localhost:8000/groups/${id}/media`, { headers });
      setMedia(mediaResponse.data);
      setFilteredMedia(mediaResponse.data);

      const membersResponse = await axios.get(`http://localhost:8000/groups/${id}/members`, { headers });
      setMembers(membersResponse.data);
    } catch (error) {
      console.error('Failed to fetch group details', error);
      setError('Failed to load group details. Please try again.');
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
      setError('');
    } catch (error: unknown) {
      console.error('Failed to add member', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.status === 404) {
          setError('User not found. Please check the username and try again.');
        } else {
          setError('Failed to add member. Please try again.');
        }
      } else {
        setError('An unknown error occurred. Please try again.');
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
      } catch (error) {
        console.error('Failed to remove member', error);
        setError('Failed to remove member. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Group Media Library</h1>
        <div>
          <button
            onClick={() => setIsSearching(!isSearching)}
            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isSearching ? 'Back to Library' : 'Add New Media'}
          </button>
          {!isSearching && (
            <button
              onClick={fetchGroupDetails}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
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
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Group Members</h2>
        <form onSubmit={addMember} className="mb-4">
          <input
            type="text"
            value={newMemberUsername}
            onChange={(e) => setNewMemberUsername(e.target.value)}
            placeholder="Username"
            className="mr-2 p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add Member
          </button>
        </form>
        <ul>
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
      </div>
    </div>
  );
};

export default GroupDetail;