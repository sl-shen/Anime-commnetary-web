import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupReviewForm from '../components/GroupReviewForm';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { FaStar, FaArrowLeft, FaTrash, FaPencilAlt, FaPlus } from 'react-icons/fa';

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
  created_at: string;
  username: string;
}

interface User {
  id: number;
  username: string;
}

const mediaTypes = [
  { id: 1, name: "书籍", icon: "📚" },
  { id: 2, name: "动画", icon: "🎬" },
  { id: 3, name: "音乐", icon: "🎵" },
  { id: 4, name: "游戏", icon: "🎮" },
  { id: 6, name: "真人", icon: "🎭" }
];

const GroupMediaDetail: React.FC = () => {
  const { groupId, mediaId } = useParams<{ groupId: string; mediaId: string }>();
  const navigate = useNavigate();
  const [media, setMedia] = useState<Media | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchMediaDetails();
    fetchReviews();
    fetchCurrentUser();
  }, [groupId, mediaId]);

  const fetchMediaDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/groups/${groupId}/media/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedia(response.data);
    } catch (error) {
      console.error('Failed to fetch media details', error);
      setError('获取媒体详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/groups/${groupId}/media/${mediaId}/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.length > 0) {
        setReviews(response.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      setReviews([]);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch current user', error);
    }
  };

  const handleReviewSubmit = () => {
    fetchReviews();
    setEditingReviewId(null);
    setShowAddReviewForm(false);
  };

  const handleDeleteReview = async (reviewId: number, reviewUserId: number) => {
    if (currentUser?.id !== reviewUserId) {
      setError('您没有权限删除这条评论');
      return;
    }

    const confirmDelete = window.confirm("确定要删除这个评论吗？此操作不可撤销。");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/groups/${groupId}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Review deleted successfully");
      fetchReviews();
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
      await axios.delete(`http://localhost:8000/groups/${groupId}/media/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Media deleted successfully");
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error('Failed to delete media', error);
      setError('删除媒体失败');
    }
  };

  const getMediaTypeName = (typeId: number) => {
    const mediaType = mediaTypes.find(type => type.id === typeId);
    return mediaType ? `${mediaType.icon} ${mediaType.name}` : '其他类型';
  };

  const formatDate = (dateString: string) => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utcDate = new Date(dateString + 'Z'); // 'Z' -- UTC 时间
    return formatInTimeZone(utcDate, userTimeZone, 'yyyy年MM月dd日 HH:mm');
  };

  if (loading) return <div className="flex justify-center items-center h-screen">加载中...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!media) return <div className="text-center mt-10">未找到媒体信息</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate(`/groups/${groupId}`)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            <FaArrowLeft className="mr-2" /> 返回群组
          </button>
          <button 
            onClick={handleDeleteMedia}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
          >
            <FaTrash className="mr-2" /> 删除媒体
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0 md:w-1/3">
              <img src={media.image} alt={media.title} className="w-full h-auto object-cover" style={{maxHeight: '500px'}} />
            </div>
            <div className="p-8 md:w-2/3">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">{getMediaTypeName(media.media_type).split(' ')[0]}</span>
                <span className="text-lg text-indigo-600 font-semibold">{getMediaTypeName(media.media_type).split(' ')[1]}</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{media.title}</h1>
              <p className="text-gray-600 leading-relaxed">{media.summary}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">评论</h2>
            <button 
              onClick={() => setShowAddReviewForm(true)} 
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
            >
              <FaPlus className="mr-2" /> 添加新评论
            </button>
          </div>

          {showAddReviewForm && (
            <div className="mb-8 bg-gray-50 p-6 rounded-lg">
              <GroupReviewForm
                mediaId={parseInt(mediaId!)}
                groupId={parseInt(groupId!)}
                onReviewSubmit={handleReviewSubmit}
                onCancel={() => setShowAddReviewForm(false)}
                currentUserId={currentUser?.id || 0}
              />
            </div>
          )}

          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="mb-6 bg-gray-50 p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-2">评分:</span>
                    <div className="flex items-center">
                      {[...Array(10)].map((_, i) => (
                        <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                      ))}
                    </div>
                    <span className="text-x text-yellow-500">{review.rating} / 10</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{formatDate(review.created_at)}</div>
                    <div className="text-sm font-semibold text-indigo-600">by {review.username}</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{review.text}</p>
                {currentUser?.id === review.user_id && (
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => setEditingReviewId(review.id)} 
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                    >
                      <FaPencilAlt className="mr-2" /> 更新
                    </button>
                    <button 
                      onClick={() => handleDeleteReview(review.id, review.user_id)} 
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                    >
                      <FaTrash className="mr-2" /> 删除
                    </button>
                  </div>
                )}
                {editingReviewId === review.id && (
                  <div className="mt-4">
                    <GroupReviewForm
                      mediaId={parseInt(mediaId!)}
                      groupId={parseInt(groupId!)}
                      initialReview={review}
                      onReviewSubmit={handleReviewSubmit}
                      onCancel={() => setEditingReviewId(null)}
                      currentUserId={currentUser?.id || 0}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-8">暂无评论</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupMediaDetail;