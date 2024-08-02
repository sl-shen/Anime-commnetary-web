import React, { useState, useEffect } from 'react';
import MediaList from '../components/MediaList';
import MediaSearch from '../components/MediaSearch';
import { getUserMedia } from '../services/ApiService';

interface Media {
  id: number;
  title: string;
  image: string;
  media_type: number;
}

const mediaTypes = [
  { id: 0, name: "全部" },
  { id: 1, name: "书籍" },
  { id: 2, name: "动画" },
  { id: 3, name: "音乐" },
  { id: 4, name: "游戏" },
  { id: 6, name: "真人" }
];

const Library: React.FC = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTag, setActiveTag] = useState(0);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);

  useEffect(() => {
    fetchUserMedia();
  }, []);

  const fetchUserMedia = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getUserMedia();
      setMedia(response.data);
      setFilteredMedia(response.data);
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

  useEffect(() => {
    if (activeTag === 0) {
      setFilteredMedia(media);
    } else {
      setFilteredMedia(media.filter(item => item.media_type === activeTag));
    }
  }, [activeTag, media]);

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
        <MediaSearch onAddMedia={handleRefresh} />
      ) : (
        <MediaList media={filteredMedia} />
      )}
    </div>
  );
};

export default Library;