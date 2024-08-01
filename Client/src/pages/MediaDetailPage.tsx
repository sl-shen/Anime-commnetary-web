import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import api from '../services/ApiService';

interface Media {
  id: number;
  title: string;
  image: string;
  summary: string;
  bangumi_id: number;
  media_type: number;
}

interface Review {
  id: number;
  text: string;
  rating: number;
  user_id: number;
}

const MediaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMediaDetails();
    fetchReview();
  }, [id]);

  const fetchMediaDetails = async () => {
    try {
      const response = await api.get(`/media/get/${id}`);
      setMedia(response.data[0]);
    } catch (error) {
      console.error('Failed to fetch media details', error);
      setError('获取媒体详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchReview = async () => {
    try {
      const response = await api.get(`/reviews/media/${id}`);
      if (response.data && response.data.length > 0) {
        setReview(response.data[0]);
        console.log("Fetched review:", response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch review', error);

    }
  };

  const handleReviewSubmit = () => {
    fetchReview();
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!media) return <div>未找到媒体信息</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3">
          <img src={media.image} alt={media.title} className="w-full rounded-lg shadow-lg" />
        </div>
        <div className="md:w-2/3 md:pl-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-4">{media.title}</h1>
          <p className="text-gray-600 mb-6">{media.summary}</p>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">您的评论</h2>
            <ReviewForm
              mediaId={parseInt(id!)}
              initialReview={review || undefined}
              onReviewSubmit={handleReviewSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetail;