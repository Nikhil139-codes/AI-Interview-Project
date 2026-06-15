import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Trophy, Clock, Target, Plus, Play, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { useSelector } from 'react-redux';

const mockPerformanceData = [
  { name: 'Int 1', score: 65, avg: 60 },
  { name: 'Int 2', score: 72, avg: 62 },
  { name: 'Int 3', score: 68, avg: 65 },
  { name: 'Int 4', score: 85, avg: 68 },
  { name: 'Int 5', score: 82, avg: 70 },
  { name: 'Int 6', score: 91, avg: 72 },
];

const mockTechData = [
  { name: 'React', value: 85 },
  { name: 'Node.js', value: 70 },
  { name: 'System Design', value: 60 },
  { name: 'Algorithms', value: 75 },
];

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState({ totalInterviews: 0, averageScore: 0, recentScores: [], recentSessions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          const config = { headers: { Authorization: `Bearer ${userData.token}` } };
          
          const [interviewsRes, analyticsRes] = await Promise.all([
            api.get('/api/interviews', config),
            api.get('/api/interviews/analytics', config)
          ]);
          
          setInterviews(interviewsRes.data);
          setAnalytics(analyticsRes.data);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-400 mt-1 font-medium">Here is your interview progress overview.</p>
        </div>
        <Link 
          to="/setup" 
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/25 transition-all hover:scale-105 active:scale-95 border border-primary-400/30"
        >
          <Plus className="w-5 h-5" />
          <span>New Interview</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Average Score', value: `${analytics.averageScore}%`, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { title: 'Interviews Completed', value: analytics.totalInterviews, icon: Target, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { title: 'Practice Time', value: `${analytics.totalInterviews * 45}m`, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            className="glassmorphism rounded-2xl p-6 relative overflow-hidden group hover:bg-dark-800/60 transition-all border border-white/5"
          >
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-gray-400 font-bold mb-1">{stat.title}</h3>
            <p className="text-4xl font-extrabold text-white">{stat.value}</p>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-400 font-bold">+12%</span>
              <span className="text-gray-500 font-medium ml-2">from last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glassmorphism rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Performance Trend</h3>
            <select className="bg-dark-800/80 border border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-300 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer">
              <option>Last 6 Interviews</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.recentScores.map((score, idx) => ({ name: `Int ${idx+1}`, score }))}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D2FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="#00D2FF" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart */}
        <div className="glassmorphism rounded-2xl p-6 flex flex-col border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">Skill Proficiency</h3>
          <div className="flex-1 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTechData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" axisLine={false} tickLine={false} width={80} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} />
                <Tooltip 
                  cursor={{ fill: '#1f2937' }}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#00D2FF" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="glassmorphism rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Recent Interviews</h3>
          <button className="text-primary-400 text-sm hover:text-primary-300 font-bold transition-colors">View All</button>
        </div>
        
        {loading ? (
          <div className="py-8 text-center text-gray-500 font-medium">Loading your history...</div>
        ) : interviews.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-gray-700 rounded-xl bg-dark-900/30">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-primary-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">No interviews yet</h4>
            <p className="text-gray-400 font-medium mb-6 max-w-md">Start your first AI mock interview to practice your skills and get detailed feedback.</p>
            <Link 
              to="/setup" 
              className="bg-dark-800 hover:bg-dark-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors border border-gray-700 shadow-sm"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.slice(0, 5).map((interview) => (
              <div key={interview._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-dark-900/50 border border-gray-800 hover:border-gray-700 transition-all group hover:bg-dark-800/80">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center border border-gray-700 shadow-sm">
                    <span className="font-bold text-lg text-primary-400">{interview.role.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white">{interview.role}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-400 font-medium mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(interview.createdAt).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                      <span>{interview.experienceLevel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 hidden md:flex">
                    {interview.techStack.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs rounded-md bg-dark-800 border border-gray-700 text-gray-300 font-bold shadow-sm">
                        {tech}
                      </span>
                    ))}
                    {interview.techStack.length > 3 && (
                      <span className="px-2.5 py-1 text-xs rounded-md bg-dark-800 border border-gray-700 text-gray-300 font-bold shadow-sm">
                        +{interview.techStack.length - 3}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => window.location.href = `/interview/${interview._id}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-dark-800 border border-gray-700 text-primary-400 group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all ml-auto shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            
            {analytics.recentSessions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-800">
                <h4 className="text-md font-bold text-white mb-4">Completed Sessions</h4>
                <div className="space-y-4">
                  {analytics.recentSessions.map((session) => (
                    <div key={session._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-green-900/10 border border-green-900/30 hover:border-green-800/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center border border-green-900/50 shadow-sm">
                          <Trophy className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-white">Score: {session.score}/100</h4>
                          <div className="text-sm text-gray-400 font-medium mt-1">Completed on {new Date(session.updatedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => window.location.href = `/interview/${session.interviewConfig}/result`}
                        className="mt-4 sm:mt-0 px-4 py-2 rounded-lg bg-green-900/30 text-green-400 font-bold hover:bg-green-800/50 transition-colors shadow-sm border border-green-900/50"
                      >
                        View Results
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardPage;
