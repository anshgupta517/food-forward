import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  role?: 'restaurant' | 'organization'; // Optional role prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();

  if (isLoading) {
    return <div>Loading authentication status...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a role is specified, check if the current user has that role
  if (role && currentUser?.userType !== role) {
    // Redirect to a generic "access denied" page or home page if role doesn't match
    // For now, redirecting to home, or could be a specific /unauthorized page
    return <Navigate to="/" replace />; 
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
