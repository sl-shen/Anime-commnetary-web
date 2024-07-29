import React, { useState } from 'react';
import { searchMedia, addMedia } from '../services/ApiService';

interface SearchResult {
  id: number;
  title: string;
  image: string;
  summary: string;
}

const MediaSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    try {
      const response = await searchMedia(query, 2); // Assuming 2 is for anime
      setResults(response.data);
    } catch (error) {
      console.error('Search failed', error);
    }
  };

  const handleAdd = async (bangumiId: number) => {
    try {
      await addMedia(bangumiId);
      alert('Media added to your library');
    } catch (error) {
      console.error('Failed to add media', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search media"
          className="flex-grow p-2 border rounded"
        />
        <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded">
          Search
        </button>
      </div>
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
              >
                Add to Library
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaSearch;
