import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trophy, Target, Zap, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const InterviewResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const userData = JSON.parse(userStr);
        const config = { headers: { Authorization: `Bearer ${userData.token}` } };
        
        const res = await axios.get(`http://localhost:5000/api/interviews/${id}`, config);
        setResult(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch interview results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Loading your results...</h2>
      </div>
    );
  }

  if (error || !result || !result.feedbackData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-red-400 font-medium mb-4 glassmorphism p-6 rounded-xl border border-red-500/30">{error || 'Results not available yet.'}</div>
        <button onClick={() => navigate('/dashboard')} className="text-primary-400 font-bold hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { feedbackData, score, interviewConfig } = result;

  const radarData = [
    { subject: 'Overall', A: feedbackData.overallScore || 0, fullMark: 100 },
    { subject: 'Technical', A: feedbackData.technicalScore || 0, fullMark: 100 },
    { subject: 'Communication', A: feedbackData.communicationScore || 0, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between glassmorphism border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 mb-6 md:mb-0">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white font-bold transition-colors mb-4 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Interview Results</h1>
          <p className="text-gray-400 font-medium flex items-center gap-2">
            <span className="bg-dark-800 px-3 py-1 rounded-lg border border-gray-700">{interviewConfig?.role || 'Unknown'}</span> 
            <span className="text-gray-600">•</span>
            <span className="bg-dark-800 px-3 py-1 rounded-lg border border-gray-700">{interviewConfig?.experienceLevel || 'Unknown'}</span>
          </p>
        </div>
        <div className="text-left md:text-right relative z-10 bg-dark-900/50 p-6 rounded-2xl border border-gray-700 shadow-inner">
          <div className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-blue-500 mb-1">
            {score}<span className="text-2xl text-gray-500">/100</span>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">Overall Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-1 glassmorphism border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col items-center">
          <h3 className="text-lg font-bold text-white mb-6 w-full text-left">Performance Radar</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glassmorphism border border-white/10 p-6 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" /> Summary
            </h3>
            <p className="text-gray-300 font-medium leading-relaxed bg-dark-900/50 p-5 rounded-2xl border border-gray-700">
              {feedbackData.feedback}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glassmorphism bg-green-900/10 border border-green-500/20 p-6 rounded-3xl shadow-xl hover:bg-green-900/20 transition-colors">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Strengths
              </h3>
              <ul className="space-y-3">
                {feedbackData.strengths?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 font-medium bg-dark-900/50 p-3 rounded-xl border border-gray-800">
                    <span className="text-green-400 mt-0.5">•</span> 
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glassmorphism bg-orange-900/10 border border-orange-500/20 p-6 rounded-3xl shadow-xl hover:bg-orange-900/20 transition-colors">
              <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Areas for Improvement
              </h3>
              <ul className="space-y-3">
                {feedbackData.weaknesses?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 font-medium bg-dark-900/50 p-3 rounded-xl border border-gray-800">
                    <span className="text-orange-400 mt-0.5">•</span> 
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultPage;
