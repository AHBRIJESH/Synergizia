
import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import AdminLogin from '@/components/AdminLogin';
import { useAdmin } from '@/contexts/AdminContext';

const Admin = () => {
  const { isAuthenticated, login, logout } = useAdmin();

  return (
    <div>
      {isAuthenticated ? (
        <AdminDashboard onLogout={logout} />
      ) : (
        <AdminLogin onLogin={login} />
      )}
    </div>
  );
};

export default Admin;
