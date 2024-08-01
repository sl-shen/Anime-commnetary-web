import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import axios from 'axios';

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
  const navigate = useNavigate();
  const [media, setMedia] = useState<Media | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchMediaDetails();
    fetchReview();
  }, [id]);

  const fetchMediaDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/media/get/${id}`);
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
      const response = await axios.get(`http://localhost:8000/reviews/media/${id}`);
      if (response.data && response.data.length > 0) {
        setReview(response.data[0]);
        console.log("Fetched review:", response.data[0]);
      } else {
        setReview(null);
      }
    } catch (error) {
      console.error('Failed to fetch review', error);
      setReview(null);
    }
  };

  const handleReviewSubmit = () => {
    fetchReview();
    setShowReviewForm(false);
  };

  const handleDeleteReview = async () => {
    if (!review) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/reviews/delete/${review.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReview(null);
      console.log("Review deleted successfully");
    } catch (error) {
      console.error('Failed to delete review', error);
      setError('删除评论失败');
    }
  };

  const handleDeleteMedia = async () => {
    if (!media) return;

    const confirmDelete = window.confirm("确定要删除这个媒体吗？此操作不可撤销。");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/media/delete/${media.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Media deleted successfully");
      navigate('/library'); // 导航到 library 页面
    } catch (error) {
      console.error('Failed to delete media', error);
      setError('删除媒体失败');
    }
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
          <button 
            onClick={handleDeleteMedia}
            className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            删除媒体
          </button>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">您的评论</h2>
            {review ? (
              <div>
                <p>评分: {review.rating}</p>
                <p>评论: {review.text}</p>
                <div className="mt-4 space-x-2">
                  <button 
                    onClick={() => setShowReviewForm(true)} 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    更新评论
                  </button>
                  <button 
                    onClick={handleDeleteReview} 
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    删除评论
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>暂无评论</p>
                <button 
                  onClick={() => setShowReviewForm(true)} 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  添加评论
                </button>
              </div>
            )}
            {showReviewForm && (
              <div className="mt-4">
                <ReviewForm
                  mediaId={parseInt(id!)}
                  initialReview={review || undefined}
                  onReviewSubmit={handleReviewSubmit}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetail;