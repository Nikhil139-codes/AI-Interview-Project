import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Award, Zap, Code2, Link as LinkIcon, Save, Loader2, Upload, FileText, Settings } from 'lucide-react';
import { updateUser } from '../features/auth/authSlice';
import api from '../utils/api';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    experienceLevel: user?.experienceLevel || '',
    github: user?.socialLinks?.github || '',
    linkedin: user?.socialLinks?.linkedin || '',
    portfolio: user?.socialLinks?.portfolio || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [resumes, setResumes] = useState(user?.uploadedResumes || []);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
        experienceLevel: user.experienceLevel || '',
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        portfolio: user.socialLinks?.portfolio || '',
      });
      setResumes(user.uploadedResumes || []);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const payload = {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills.split(',').map((s) => s.trim()).filter((s) => s !== ''),
        experienceLevel: formData.experienceLevel,
        socialLinks: {
          github: formData.github,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
        },
      };

      const { data } = await api.put('/api/users/profile', payload, config);
      dispatch(updateUser(data));
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      setIsError(true);
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setIsError(true);
      setMessage('Only PDF files are allowed for resumes.');
      return;
    }

    setUploadingResume(true);
    setIsError(false);
    setMessage('');

    const formDataUpload = new FormData();
    formDataUpload.append('resume', file);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await api.post('/api/users/resume', formDataUpload, config);
      
      const updatedUser = { ...user, uploadedResumes: data };
      dispatch(updateUser(updatedUser));
      setResumes(data);
      setMessage('Resume uploaded successfully!');
    } catch (error) {
      console.error(error);
      setIsError(true);
      setMessage(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Profile Card */}
      <div className="glassmorphism rounded-3xl p-8 border border-white/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 p-1 shadow-xl">
            <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center">
              <User className="w-12 h-12 text-primary-400" />
            </div>
          </div>
          {user?.isAdmin && (
            <div className="absolute bottom-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              ADMIN
            </div>
          )}
        </div>

        <div className="text-center md:text-left flex-1 z-10">
          <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
          <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2 mb-4">
            <Mail className="w-4 h-4" /> {user?.email}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {(user?.skills || []).map((skill, idx) => (
              <span key={idx} className="bg-dark-800 text-primary-400 px-3 py-1 rounded-full text-sm font-medium border border-primary-500/30">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="flex gap-6 z-10">
          <div className="text-center bg-dark-900/50 p-4 rounded-2xl border border-white/5 min-w-[100px]">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{user?.streak || 0}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-1">Day Streak</div>
          </div>
          <div className="text-center bg-dark-900/50 p-4 rounded-2xl border border-white/5 min-w-[100px]">
            <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{user?.badges?.length || 0}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-1">Badges</div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl font-medium border ${isError ? 'bg-red-900/30 text-red-400 border-red-500/30' : 'bg-green-900/30 text-green-400 border-green-500/30'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Profile Form */}
          <div className="glassmorphism rounded-3xl p-8 border border-white/10 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-400" /> Profile Settings
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-dark-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full bg-dark-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="">Select Level</option>
                    <option value="Intern">Intern</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-dark-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Skills (comma separated)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Code2 className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full bg-dark-900/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="React, Node.js, Python..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">GitHub URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      className="w-full bg-dark-900/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">LinkedIn URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      className="w-full bg-dark-900/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          {/* Uploaded Resumes */}
          <div className="glassmorphism rounded-3xl p-6 border border-white/10 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Resumes</span>
              
              <label className="cursor-pointer text-xs font-bold bg-dark-800 hover:bg-dark-700 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-white">
                {uploadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload PDF
                <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} disabled={uploadingResume} />
              </label>
            </h2>

            <div className="space-y-3">
              {resumes.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No resumes uploaded yet.</p>
              ) : (
                resumes.map((resume, idx) => (
                  <div key={idx} className="bg-dark-900/50 p-3 rounded-xl border border-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-bold truncate">{resume.fileName}</p>
                      <p className="text-gray-500 text-xs">{new Date(resume.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="glassmorphism rounded-3xl p-6 border border-white/10 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" /> Achievements
            </h2>
            <div className="space-y-4">
              {(user?.achievements?.length > 0 ? user.achievements : [
                { title: "First Interview", description: "Completed your first AI interview session.", date: new Date().toISOString() }
              ]).map((achievement, idx) => (
                <div key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-[-16px] before:w-[2px] before:bg-gray-800 last:before:hidden">
                  <div className="absolute left-[3px] top-2 w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(0,210,255,0.8)]"></div>
                  <h4 className="text-white font-bold text-sm">{achievement.title}</h4>
                  <p className="text-gray-400 text-xs mt-1">{achievement.description}</p>
                  <p className="text-gray-600 text-[10px] mt-1 font-medium">{new Date(achievement.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
