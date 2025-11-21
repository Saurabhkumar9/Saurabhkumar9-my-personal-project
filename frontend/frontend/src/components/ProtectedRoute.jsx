// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Simple loading component
const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

// Admin Route Protection
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <Loader />;
  
  
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return isAuthenticated && isAdmin ? children : <Navigate to="/auth" replace />;
};


export const CoachRoute = ({ children }) => {
  const { isAuthenticated, isCoach, loading } = useAuth();

  if (loading) return <Loader />;
  
  
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return isAuthenticated && isCoach ? children : <Navigate to="/auth" replace />;
};