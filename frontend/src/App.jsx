import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewRoomPage from './pages/InterviewRoomPage';
import InterviewResultPage from './pages/InterviewResultPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import DSADashboardPage from './pages/DSADashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-dark-950 text-white selection:bg-primary-500 selection:text-white font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/setup" element={<InterviewSetupPage />} />
            <Route path="/resume" element={<ResumeAnalyzerPage />} />
            <Route path="/dsa" element={<DSADashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/interview/:id" element={<InterviewRoomPage />} />
            <Route path="/interview/:id/result" element={<InterviewResultPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
