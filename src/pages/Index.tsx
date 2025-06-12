
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle navigation based on user role
    if (user) {
      if (user.role === 'admin') {
        console.log('Redirecting admin to dashboard');
      } else if (user.role === 'user') {
        console.log('Redirecting user to dashboard');
      }
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Render dashboard based on user role
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
};

export default Index;
