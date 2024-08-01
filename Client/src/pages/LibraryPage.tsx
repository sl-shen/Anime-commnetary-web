import React, { useState, useEffect } from 'react';
import MediaList from '../components/MediaList';
import MediaSearch from '../components/MediaSearch';
import { getUserMedia } from '../services/ApiService';

const Library: React.FC = () => {
  const [media, setMedia] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserMedia();
  }, []);

  const fetchUserMedia = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getUserMedia();
      setMedia(response.data);
    } catch (error) {
      console.error('Failed to fetch user media', error);
      setError('Failed to load media. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUserMedia();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Media Library</h1>
        <div>
          <button
            onClick={() => setIsSearching(!isSearching)}
            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isSearching ? 'Back to Library' : 'Add New Media'}
          </button>
          {!isSearching && (
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isSearching ? (
        <MediaSearch onAddMedia={handleRefresh} />
      ) : (
        <MediaList media={media} />
      )}
    </div>
  );
};

export default Library;