import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupReviewForm from '../components/GroupReviewForm';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';

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

const mediaTypes = [
  { id: 1, name: "书籍" },
  { id: 2, name: "动画" },
  { id: 3, name: "音乐" },
  { id: 4, name: "游戏" },
  { id: 6, name: "真人" }
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

  useEffect(() => {
    fetchMediaDetails();
    fetchReviews();
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

  const handleReviewSubmit = () => {
    fetchReviews();
    setEditingReviewId(null);
    setShowAddReviewForm(false);
  };

  const handleDeleteReview = async (reviewId: number) => {
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
    return mediaType ? mediaType.name : '其他类型';
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
    <div className="container mx-auto px-4 py-8 max-w-6xl relative">
      <button 
        onClick={() => navigate(`/groups/${groupId}`)}
        className="absolute top-0 left-0 mt-4 ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300"
      >
        返回群组
      </button>

      <button 
        onClick={handleDeleteMedia}
        className="absolute top-0 right-0 mt-4 mr-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">评论</h2>
          <button 
            onClick={() => setShowAddReviewForm(true)} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
          >
            添加新评论
          </button>
        </div>

        {showAddReviewForm && (
          <div className="mb-6">
            <GroupReviewForm
              mediaId={parseInt(mediaId!)}
              groupId={parseInt(groupId!)}
              onReviewSubmit={handleReviewSubmit}
              onCancel={() => setShowAddReviewForm(false)}
            />
          </div>
        )}

        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="mb-6 bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xl font-bold mr-2">评分:</span>
                  <span className="text-2xl text-yellow-500">{review.rating} / 10</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{formatDate(review.created_at)}</div>
                  <div className="text-sm text-gray-600">by {review.username}</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4"><span className="font-bold">评论:</span> {review.text}</p>
              <div className="mt-4 space-x-2">
                <button 
                  onClick={() => setEditingReviewId(review.id)} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                >
                  更新评论
                </button>
                <button 
                  onClick={() => handleDeleteReview(review.id)} 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                >
                  删除评论
                </button>
              </div>
              {editingReviewId === review.id && (
                <div className="mt-4">
                  <GroupReviewForm
                    mediaId={parseInt(mediaId!)}
                    groupId={parseInt(groupId!)}
                    initialReview={review}
                    onReviewSubmit={handleReviewSubmit}
                    onCancel={() => setEditingReviewId(null)}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">暂无评论</p>
        )}
      </div>
    </div>
  );
};

export default GroupMediaDetail;