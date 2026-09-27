// AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminPage from '../../admin/AdminPage';

const AdminLayout: React.FC = () => {
  return (
    <>
      <AdminPage />
      
    </>
  );
};

export default AdminLayout;
