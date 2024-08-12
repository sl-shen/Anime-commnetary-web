import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = "http://localhost:8000";

interface ManualGroupMediaAddProps {
  groupId: string;
  onAddMedia: () => void;
}

const ManualGroupMediaAdd: React.FC<ManualGroupMediaAddProps> = ({ groupId, onAddMedia }) => {
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState(1);
  const [image, setImage] = useState('');
  const [summary, setSummary] = useState('');
  const [bangumiId, setBangumiId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${apiUrl}/groups/${groupId}/media/add-manual`,
        {
          title,
          media_type: mediaType,
          image,
          summary,
          bangumi_id: bangumiId ? parseInt(bangumiId) : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onAddMedia();
      setTitle('');
      setMediaType(1);
      setImage('');
      setSummary('');
      setBangumiId('');
      alert('Media added to your library');
    } catch (error) {
      console.error('Failed to add media', error);
      alert('Failed to add media. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Add Media Manually</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mediaType">
          Media Type
        </label>
        <select
          id="mediaType"
          value={mediaType}
          onChange={(e) => setMediaType(Number(e.target.value))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value={1}>Book</option>
          <option value={2}>Anime</option>
          <option value={3}>Music</option>
          <option value={4}>Game</option>
          <option value={6}>Real</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
          Image URL
        </label>
        <input
          type="url"
          id="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="summary">
          Summary
        </label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows={4}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bangumiId">
          Bangumi ID (optional)
        </label>
        <input
          type="number"
          id="bangumiId"
          value={bangumiId}
          onChange={(e) => setBangumiId(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Add Media
      </button>
    </form>
  );
};

export default ManualGroupMediaAdd;