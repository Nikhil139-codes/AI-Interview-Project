import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Bot, KeyRound } from 'lucide-react';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message || 'Password reset link has been sent to your email.');
      setEmail('');
    } catch (err) {
      setError(
        (err.response && err.response.data && err.response.data.message) ||
        'Something went wrong. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glassmorphism rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
              <KeyRound className="text-white w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-gray-400 text-center font-medium">Enter your email and we'll send you a password reset link.</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl leading-5 bg-dark-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all sm:text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/25 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-dark-900 transition-all transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? 'Sending Link...' : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-800 pt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
