import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user || !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
