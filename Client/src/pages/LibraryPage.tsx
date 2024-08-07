import React, { useState, useEffect } from 'react';
import MediaList from '../components/MediaList';
import MediaSearch from '../components/MediaSearch';
import { getUserMedia } from '../services/ApiService';
import { FaBook, FaFilm, FaMusic, FaGamepad, FaTheaterMasks, FaPlus, FaSync } from 'react-icons/fa';

interface Media {
  id: number;
  title: string;
  image: string;
  media_type: number;
}

const mediaTypes = [
  { id: 0, name: "全部", icon: FaBook },
  { id: 1, name: "书籍", icon: FaBook },
  { id: 2, name: "动画", icon: FaFilm },
  { id: 3, name: "音乐", icon: FaMusic },
  { id: 4, name: "游戏", icon: FaGamepad },
  { id: 6, name: "真人", icon: FaTheaterMasks }
];

const Library: React.FC = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTag, setActiveTag] = useState(0);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);

  useEffect(() => {
    fetchUserMedia();
  }, []);

  const fetchUserMedia = async () => {
    setIsLoading(true);
    try {
      const response = await getUserMedia();
      setMedia(response.data);
      setFilteredMedia(response.data);
    } catch (error) {
      console.error('Failed to fetch user media', error);
      alert('Failed to load media. Please try again.');
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
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Media Library</h1>
            <p className="text-lg mb-4">Manage and explore your personal media collection</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end mb-2">
              <span>{media.length} Items</span>
            </div>
            <div className="flex space-x-2">
              {mediaTypes.slice(1).map(type => (
                <type.icon key={type.id} className="text-white" />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setIsSearching(!isSearching)}
            className="px-4 py-2 bg-white text-purple-600 rounded hover:bg-purple-100 transition duration-300 flex items-center"
          >
            <FaPlus className="mr-2" />
            {isSearching ? 'Back to Library' : 'Add New Media'}
          </button>
          {!isSearching && (
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-100 transition duration-300 flex items-center"
              disabled={isLoading}
            >
              <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {!isSearching && (
        <div className="flex space-x-2 mb-4">
          {mediaTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveTag(type.id)}
              className={`px-4 py-2 rounded flex items-center ${
                activeTag === type.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <type.icon className="mr-2" />
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