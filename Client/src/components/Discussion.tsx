import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { FaArrowLeft, FaPlus, FaReply, FaTrash } from 'react-icons/fa';

const apiUrl = "http://localhost:8000"

interface Discussion {
  id: number;
  title: string;
  content: string;
  created_at: string;
  username: string;
  comments: Comment[];
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  username: string;
}

interface CurrentUser {
  id: number;
  username: string;
}

const DiscussionPage: React.FC = () => {
  const { groupId, mediaId } = useParams<{ groupId: string; mediaId: string }>();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetchDiscussions();
    fetchCurrentUser();
  }, [groupId, mediaId]);

  const fetchDiscussions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/groups/${groupId}/media/${mediaId}/discussions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiscussions(response.data);
    } catch (error) {
      setError('Failed to fetch discussions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch current user', error);
    }
  };

  const createDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${apiUrl}/groups/${groupId}/media/${mediaId}/discussions/`,
        newDiscussion,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewDiscussion({ title: '', content: '' });
      fetchDiscussions();
    } catch (error) {
      setError('Failed to create discussion');
    }
  };

  const createComment = async (discussionId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${apiUrl}/discussions/${discussionId}/comments/`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      fetchDiscussionDetails(discussionId);
    } catch (error) {
      setError('Failed to create comment');
    }
  };

  const fetchDiscussionDetails = async (discussionId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/discussions/${discussionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedDiscussion(response.data);
    } catch (error) {
      setError('Failed to fetch discussion details');
    }
  };

  const deleteDiscussion = async (discussionId: number) => {
    if (window.confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${apiUrl}/discussions/${discussionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDiscussions();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            setError('You are not authorized to delete this discussion.');
          } else if (error.response?.status === 404) {
            setError('Discussion not found.');
          } else {
            setError('An error occurred while deleting the discussion.');
          }
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utcDate = new Date(dateString + 'Z');
    return formatInTimeZone(utcDate, userTimeZone, 'yyyy年MM月dd日 HH:mm');
  };

  if (loading) return <div className="flex justify-center items-center h-screen">加载中...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to={`/groups/${groupId}/media/${mediaId}`}
          className="flex items-center mb-6 text-blue-500 hover:text-blue-600"
        >
          <FaArrowLeft className="mr-2" /> 返回媒体详情
        </Link>

        <h1 className="text-3xl font-bold mb-6">讨论区</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">创建新讨论</h2>
          <form onSubmit={createDiscussion}>
            <input
              type="text"
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
              placeholder="讨论标题"
              className="w-full p-2 border rounded mb-4"
              required
            />
            <textarea
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
              placeholder="讨论内容"
              className="w-full p-2 border rounded mb-4"
              rows={4}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FaPlus className="inline mr-2" /> 创建讨论
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">讨论列表</h2>
          {discussions.map((discussion) => (
            <div key={discussion.id} className="mb-4 p-4 border rounded">
              <div className="flex justify-between items-start">
                <h3
                  className="text-xl font-bold mb-2 cursor-pointer text-blue-500 hover:text-blue-600"
                  onClick={() => fetchDiscussionDetails(discussion.id)}
                >
                  {discussion.title}
                </h3>
                {currentUser && currentUser.username === discussion.username && (
                  <button
                    onClick={() => deleteDiscussion(discussion.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <FaTrash className="inline mr-1" /> 删除
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-2">
                由 {discussion.username} 发起于 {formatDate(discussion.created_at)}
              </p>
              {selectedDiscussion && selectedDiscussion.id === discussion.id && (
                <div className="mt-4">
                  <p className="mb-4">{selectedDiscussion.content}</p>
                  <h4 className="font-bold mb-2">评论：</h4>
                  {selectedDiscussion.comments.map((comment) => (
                    <div key={comment.id} className="mb-2 p-2 bg-gray-100 rounded">
                      <p>{comment.content}</p>
                      <p className="text-sm text-gray-500">
                        {comment.username} - {formatDate(comment.created_at)}
                      </p>
                    </div>
                  ))}
                  <div className="mt-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="添加评论"
                      className="w-full p-2 border rounded mb-2"
                      rows={2}
                    />
                    <button
                      onClick={() => createComment(discussion.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <FaReply className="inline mr-2" /> 回复
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscussionPage;