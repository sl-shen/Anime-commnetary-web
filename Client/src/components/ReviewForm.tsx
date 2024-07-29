import React, { useState } from 'react';
import { addReview, updateReview } from '../services/ApiService';

interface ReviewFormProps {
  mediaId: number;
  initialReview?: { id: number; text: string; rating: number };
  onReviewSubmit: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ mediaId, initialReview, onReviewSubmit }) => {
  const [text, setText] = useState(initialReview?.text || '');
  const [rating, setRating] = useState(initialReview?.rating || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialReview) {
        await updateReview(initialReview.id, text, rating);
      } else {
        await addReview(mediaId, text, rating);
      }
      onReviewSubmit();
    } catch (error) {
      console.error('Failed to submit review', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your review"
        className="w-full p-2 border rounded"
        rows={4}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <input
          type="number"
          min={0}
          max={5}
          step={0.5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 block w-full p-2 border rounded"
        />
      </div>
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
        {initialReview ? 'Update Review' : 'Add Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
