import React, { useState, useEffect } from 'react';
import MediaList from '../components/MediaList';
import MediaSearch from '../components/MediaSearch';
import { getUserMedia } from '../services/ApiService';

const Library: React.FC = () => {
  const [media, setMedia] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchUserMedia();
  }, []);

  const fetchUserMedia = async () => {
    try {
      const response = await getUserMedia();
      setMedia(response.data);
    } catch (error) {
      console.error('Failed to fetch user media', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Media Library</h1>
      <button
        onClick={() => setIsSearching(!isSearching)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isSearching ? 'Back to Library' : 'Add New Media'}
      </button>
      {isSearching ? (
        <MediaSearch />
      ) : (
        <MediaList media={media} />
      )}
    </div>
  );
};

export default Library;
