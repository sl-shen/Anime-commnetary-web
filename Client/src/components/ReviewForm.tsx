import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ReviewFormProps {
  mediaId: number;
  initialReview?: { id: number; text: string; rating: number };
  onReviewSubmit: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ mediaId, initialReview, onReviewSubmit, onCancel }) => {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialReview) {
      setText(initialReview.text);
      setRating(initialReview.rating);
    }
  }, [initialReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (text.trim() === '' || rating < 0 || rating > 10) {
      setError('请输入有效的评论和评分（0-10）');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // 假设你的token存储在localStorage中
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (initialReview) {
        console.log('Sending update data:', { text, rating });
        await axios.put(`http://localhost:8000/reviews/update/${initialReview.id}`, { text, rating }, config);
      } else {
        console.log('Sending add data:', { text, rating });
        await axios.post(`http://localhost:8000/reviews/add/${mediaId}`, { text, rating }, config);
      }
      onReviewSubmit();
      if (!initialReview) {
        setText('');
        setRating(0);
      }
    } catch (error) {
      console.error('Failed to submit review', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data);
        setError(`提交评论失败: ${error.response.data.detail || '未知错误'}`);
      } else {
        setError('提交评论失败，请稍后重试');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="写下您的评论"
        className="w-full p-2 border rounded"
        rows={4}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">评分</label>
        <input
          type="number"
          min={0}
          max={10}
          step={1}
          value={rating}
          onChange={(e) => setRating(Math.round(Number(e.target.value)))}
          className="mt-1 block w-full p-2 border rounded"
        />
      </div>
      <div className="flex space-x-2">
        <button type="submit" className="flex-1 p-2 bg-blue-500 text-white rounded">
          {initialReview ? '更新评论' : '添加评论'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 p-2 bg-gray-300 text-gray-700 rounded">
          取消
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;