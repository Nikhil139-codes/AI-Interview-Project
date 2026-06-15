import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BarChart3, MessageSquare, Activity, Trash2, Edit, Save, Plus, Loader2 } from 'lucide-react';
import api from '../utils/api';

const AdminDashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for Overview/Analytics
  const [analytics, setAnalytics] = useState(null);
  
  // State for Users
  const [usersList, setUsersList] = useState([]);
  
  // State for Prompts
  const [prompts, setPrompts] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${user?.token}` }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'overview') {
        const { data } = await api.get('/api/admin/analytics', axiosConfig);
        setAnalytics(data);
      } else if (activeTab === 'users') {
        const { data } = await api.get('/api/admin/users', axiosConfig);
        setUsersList(data);
      } else if (activeTab === 'prompts') {
        const { data } = await api.get('/api/admin/prompts', axiosConfig);
        setPrompts(data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Ensure you have admin privileges.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/admin/users/${id}`, axiosConfig);
        setUsersList(usersList.filter(u => u._id !== id));
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const handleSavePrompt = async (e) => {
    e.preventDefault();
    try {
      if (editingPrompt._id) {
        await api.put(`/api/admin/prompts/${editingPrompt._id}`, editingPrompt, axiosConfig);
      } else {
        // Since we put logic in PUT, passing a fake ID to create if not exists
        await api.put(`/api/admin/prompts/new`, editingPrompt, axiosConfig);
      }
      setEditingPrompt(null);
      fetchData(); // Refresh prompts
    } catch (err) {
      alert('Failed to save prompt.');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'users', name: 'Manage Users', icon: Users },
    { id: 'prompts', name: 'System Prompts', icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="glassmorphism rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 relative z-10">Admin Control Center</h1>
        <p className="text-gray-400 font-medium relative z-10">Manage platform resources, monitor usage, and configure AI behavior.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                  : 'glassmorphism text-gray-400 hover:text-white border border-white/5 hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-400 p-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
      ) : (
        <div className="mt-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Users', value: analytics.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-500/20' },
                { title: 'Total Interviews', value: analytics.totalInterviews, icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-900/20 border-green-500/20' },
                { title: 'Active Interviews', value: analytics.activeInterviews, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-500/20' },
                { title: 'Avg. Score', value: `${analytics.averageScore}%`, icon: BarChart3, color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-500/20' }
              ].map((stat, idx) => (
                <div key={idx} className={`glassmorphism rounded-3xl p-6 border ${stat.bg} shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform`}>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="text-gray-400 font-bold uppercase tracking-wider text-xs">{stat.title}</div>
                    <div className={`p-2 rounded-lg bg-dark-900/50 border border-white/5 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-white relative z-10">{stat.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="glassmorphism rounded-3xl p-6 border border-white/10 shadow-xl overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-6">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                      <th className="pb-4 font-bold px-4">Name</th>
                      <th className="pb-4 font-bold px-4">Email</th>
                      <th className="pb-4 font-bold px-4">Role</th>
                      <th className="pb-4 font-bold px-4">Joined</th>
                      <th className="pb-4 font-bold px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-white font-medium">{u.name}</td>
                        <td className="py-4 px-4 text-gray-400">{u.email}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.isAdmin ? 'bg-primary-900/50 text-primary-400 border border-primary-500/30' : 'bg-dark-800 text-gray-400 border border-gray-700'}`}>
                            {u.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-right">
                          {!u.isAdmin && (
                            <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/30 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-500">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROMPTS TAB */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">System Prompts</h2>
                <button 
                  onClick={() => setEditingPrompt({ name: '', description: '', content: '', isActive: true })}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Prompt
                </button>
              </div>

              {editingPrompt ? (
                <div className="glassmorphism rounded-3xl p-6 border border-primary-500/30 shadow-[0_0_30px_rgba(0,210,255,0.1)]">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingPrompt._id ? 'Edit Prompt' : 'Create New Prompt'}
                  </h3>
                  <form onSubmit={handleSavePrompt} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Prompt Name</label>
                        <input 
                          type="text" 
                          required
                          value={editingPrompt.name} 
                          onChange={e => setEditingPrompt({...editingPrompt, name: e.target.value})}
                          className="w-full bg-dark-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="e.g., SYSTEM_INTERVIEWER"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Description</label>
                        <input 
                          type="text" 
                          value={editingPrompt.description} 
                          onChange={e => setEditingPrompt({...editingPrompt, description: e.target.value})}
                          className="w-full bg-dark-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="Brief description of usage"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-1">System Prompt Content</label>
                      <textarea 
                        required
                        rows="8"
                        value={editingPrompt.content} 
                        onChange={e => setEditingPrompt({...editingPrompt, content: e.target.value})}
                        className="w-full bg-dark-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm leading-relaxed"
                        placeholder="You are an expert technical interviewer..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="isActive"
                        checked={editingPrompt.isActive}
                        onChange={e => setEditingPrompt({...editingPrompt, isActive: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-700 text-primary-500 bg-dark-900 focus:ring-primary-500 focus:ring-offset-dark-950"
                      />
                      <label htmlFor="isActive" className="text-sm font-bold text-gray-300">Active</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                      <button 
                        type="button" 
                        onClick={() => setEditingPrompt(null)}
                        className="px-6 py-2 rounded-xl text-gray-400 hover:text-white font-bold transition-colors border border-transparent hover:border-gray-700"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {prompts.map(prompt => (
                    <div key={prompt._id} className="glassmorphism rounded-2xl p-6 border border-white/10 relative group hover:border-primary-500/30 transition-colors">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingPrompt(prompt)} className="p-2 bg-dark-800 rounded-lg text-gray-400 hover:text-white border border-gray-700">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-2 h-2 rounded-full ${prompt.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`} />
                        <h3 className="font-bold text-white">{prompt.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">{prompt.description}</p>
                      <div className="bg-dark-900 rounded-xl p-3 border border-gray-800">
                        <p className="text-xs font-mono text-gray-500 line-clamp-3 leading-relaxed">{prompt.content}</p>
                      </div>
                    </div>
                  ))}
                  {prompts.length === 0 && (
                    <div className="col-span-full text-center py-12 glassmorphism rounded-3xl border border-dashed border-gray-700">
                      <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-400 mb-2">No Prompts Configured</h3>
                      <p className="text-gray-500 text-sm max-w-md mx-auto">Create system prompts to dynamically control the behavior of the AI interviewer.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
