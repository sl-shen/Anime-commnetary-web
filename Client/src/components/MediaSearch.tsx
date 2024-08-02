import React, { useState } from 'react';
import { searchMedia, addMedia } from '../services/ApiService';

interface SearchResult {
  id: number;
  title: string;
  image: string;
  summary: string;
}

const mediaTypes = [
  { id: 1, name: "书籍" },
  { id: 2, name: "动画" },
  { id: 3, name: "音乐" },
  { id: 4, name: "游戏" },
  { id: 6, name: "真人" }
];

const MediaSearch: React.FC<{ onAddMedia: () => void }> = ({ onAddMedia }) => {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState(2); // 默认为动画
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await searchMedia(query, mediaType);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed', error);
      setError('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (bangumiId: number) => {
    setError(null);
    setLoading(true);
    try {
      await addMedia(bangumiId);
      alert('Media added to your library');
      onAddMedia();
    } catch (error) {
      console.error('Failed to add media', error);
      setError('无法添加到库，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索媒体"
          className="flex-grow p-2 border rounded"
        />
        <select
          value={mediaType}
          onChange={(e) => setMediaType(Number(e.target.value))}
          className="p-2 border rounded"
        >
          {mediaTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        <button 
          onClick={handleSearch} 
          className="p-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? '搜索中...' : '搜索'}
        </button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="flex space-x-4 bg-white p-4 rounded-lg shadow">
            <img src={result.image} alt={result.title} className="w-24 h-36 object-cover rounded" />
            <div className="flex-grow">
              <h3 className="text-lg font-medium">{result.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{result.summary}</p>
              <button
                onClick={() => handleAdd(result.id)}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
                disabled={loading}
              >
                {loading ? '添加中...' : '添加到库'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaSearch;