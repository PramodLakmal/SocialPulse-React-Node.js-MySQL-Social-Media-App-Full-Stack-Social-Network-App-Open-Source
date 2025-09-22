import React, { useState, useEffect } from 'react';
import axios from '../../axios';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/admin/analytics?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your social media platform</p>
        </div>

        {/* Period selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Analytics Period
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={analytics?.total_users || 0}
            icon="👥"
            color="bg-blue-500"
          />
          <StatCard
            title="Total Posts"
            value={analytics?.total_posts || 0}
            icon="📝"
            color="bg-green-500"
          />
          <StatCard
            title="Total Comments"
            value={analytics?.total_comments || 0}
            icon="💬"
            color="bg-yellow-500"
          />
          <StatCard
            title="Total Likes"
            value={analytics?.total_likes || 0}
            icon="❤️"
            color="bg-red-500"
          />
        </div>

        {/* Growth Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title={`New Users (${period} days)`}
            value={analytics?.new_users || 0}
            icon="📈"
            color="bg-purple-500"
          />
          <StatCard
            title={`New Posts (${period} days)`}
            value={analytics?.new_posts || 0}
            icon="📊"
            color="bg-indigo-500"
          />
          <StatCard
            title={`Active Users (${period} days)`}
            value={analytics?.active_users || 0}
            icon="⚡"
            color="bg-pink-500"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Registration Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              User Registration Trends (Last 7 days)
            </h3>
            <div className="space-y-2">
              {analytics?.user_trends?.map((trend, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {new Date(trend.date).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{trend.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Users by Posts
            </h3>
            <div className="space-y-3">
              {analytics?.top_users?.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {user.post_count} posts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              title="Manage Users"
              icon="👥"
              href="/admin/users"
            />
            <QuickActionButton
              title="Manage Posts"
              icon="📝"
              href="/admin/posts"
            />
            <QuickActionButton
              title="Manage Comments"
              icon="💬"
              href="/admin/comments"
            />
            <QuickActionButton
              title="View Reports"
              icon="📊"
              href="/admin/reports"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`${color} rounded-lg p-3 mr-4`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ title, icon, href }) => (
  <a
    href={href}
    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
  >
    <span className="text-2xl mb-2">{icon}</span>
    <span className="text-sm font-medium text-gray-700">{title}</span>
  </a>
);

export default AdminDashboard;