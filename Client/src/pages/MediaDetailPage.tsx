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

const mediaTypes = [
  { id: 1, name: "书籍" },
  { id: 2, name: "动画" },
  { id: 3, name: "音乐" },
  { id: 4, name: "游戏" },
  { id: 6, name: "真人" }
];

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

 const getMediaTypeName = (typeId: number) => {
    const mediaType = mediaTypes.find(type => type.id === typeId);
    return mediaType ? mediaType.name : '其他类型';
  };

  if (loading) return <div className="flex justify-center items-center h-screen">加载中...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!media) return <div className="text-center mt-10">未找到媒体信息</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative">
      <button 
        onClick={() => navigate('/library')}
        className="absolute top-0 left-0 mt-4 ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300"
      >
        返回库
      </button>

      <button 
        onClick={handleDeleteMedia}
        className="absolute top-0 right-0 mt-4 ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
      >
        删除媒体
      </button>

      <div className="mt-16 bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/3">
            <img src={media.image} alt={media.title} className="w-full h-auto object-cover" style={{maxHeight: '500px'}} />
          </div>
          <div className="p-8 md:w-2/3">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {getMediaTypeName(media.media_type)}
            </div>
            <h1 className="mt-1 text-4xl font-bold text-gray-900">{media.title}</h1>
            <p className="mt-4 text-gray-600">{media.summary}</p>
            
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">您的评论</h2>
        {review ? (
          <div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-xl font-bold mr-2">评分:</span>
                <span className="text-2xl text-yellow-500">{review.rating} / 10</span>
              </div>
              <p className="text-gray-700"><span className="font-bold">评论:</span> {review.text}</p>
            </div>
            <div className="mt-4 space-x-2">
              <button 
                onClick={() => setShowReviewForm(true)} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
              >
                更新评论
              </button>
              <button 
                onClick={handleDeleteReview} 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
              >
                删除评论
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600">暂无评论</p>
            <button 
              onClick={() => setShowReviewForm(true)} 
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
            >
              添加评论
            </button>
          </div>
        )}
        {showReviewForm && (
          <div className="mt-6">
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
  );
};

export default MediaDetail;