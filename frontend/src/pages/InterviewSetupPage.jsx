import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Briefcase, Code2, GraduationCap, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const InterviewSetupPage = () => {
  const [formData, setFormData] = useState({
    role: '',
    experienceLevel: '',
    techStack: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role || !formData.experienceLevel || !formData.techStack) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('role', formData.role);
      data.append('experienceLevel', formData.experienceLevel);
      data.append('techStack', formData.techStack);
      if (resumeFile) {
        data.append('resume', resumeFile);
      }

      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr);
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userData.token}`,
        },
      };

      const res = await axios.post('http://localhost:5000/api/interviews/setup', data, config);
      
      // Redirect to the actual interview room
      navigate(`/interview/${res.data._id}`);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong while setting up the interview.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-white">
          Configure Your Interview
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
          Tailor your mock interview experience by providing details about the role, your experience, and uploading your resume. Our AI will customize the questions accordingly.
        </p>
      </div>

      <div className="glassmorphism rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
          
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Role Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary-400" />
                Target Role *
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="e.g. Senior Frontend Developer"
                className="w-full bg-dark-900/50 border border-gray-700 rounded-xl px-5 py-4 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white placeholder-gray-500 font-medium"
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary-400" />
                Experience Level *
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full bg-dark-900/50 border border-gray-700 rounded-xl px-5 py-4 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white appearance-none font-medium cursor-pointer"
              >
                <option value="" disabled className="text-gray-500">Select level</option>
                <option value="Internship">Internship</option>
                <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                <option value="Mid Level (3-5 years)">Mid Level (3-5 years)</option>
                <option value="Senior (5+ years)">Senior (5+ years)</option>
                <option value="Lead/Manager">Lead/Manager</option>
              </select>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary-400" />
              Tech Stack & Skills *
            </label>
            <textarea
              name="techStack"
              value={formData.techStack}
              onChange={handleInputChange}
              placeholder="e.g. React, Node.js, System Design, Data Structures (Comma separated)"
              rows={3}
              className="w-full bg-dark-900/50 border border-gray-700 rounded-xl px-5 py-4 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white placeholder-gray-500 resize-none font-medium"
            />
          </div>

          {/* Resume Upload */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Upload className="w-4 h-4 text-green-400" />
              Upload Resume (Optional)
            </label>
            <div className="relative group">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full border-2 border-dashed ${resumeFile ? 'border-primary-500 bg-primary-500/10' : 'border-gray-600 bg-dark-900/50 group-hover:border-primary-400 group-hover:bg-dark-800'} rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center gap-4`}>
                {resumeFile ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                      <CheckCircle2 className="w-8 h-8 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{resumeFile.name}</p>
                      <p className="text-gray-400 text-sm mt-1 font-medium">Ready to be analyzed</p>
                    </div>
                    <button type="button" onClick={(e) => { e.preventDefault(); setResumeFile(null); }} className="text-sm text-red-400 font-bold hover:text-red-300 mt-2 z-20 relative">Remove file</button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-gray-700">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold mb-1">Click to upload or drag and drop</p>
                      <p className="text-gray-500 text-sm font-medium">PDF (max. 5MB)</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              If provided, our AI will generate questions specifically tailored to your past experience and projects.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white px-8 py-5 rounded-xl font-bold text-lg shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 border border-transparent disabled:border-gray-700"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Start Interview</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default InterviewSetupPage;
