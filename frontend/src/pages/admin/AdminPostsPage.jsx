import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import PostManagement from '../../components/admin/PostManagement';

const AdminPostsPage = () => {
  return (
    <AdminLayout>
      <PostManagement />
    </AdminLayout>
  );
};

export default AdminPostsPage;