import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { useSelector } from 'react-redux';

const ResumeAnalyzerPage = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const { user } = useSelector((state) => state.auth);

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

  const handleAnalyze = async () => {
    if (!resumeFile) return;
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('resume', resumeFile);

      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userData.token}`,
        },
      };

      const res = await axios.post('http://localhost:5000/api/resume/analyze', data, config);
      setAnalysis(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Resume Analyzer</h1>
        <p className="text-gray-400 font-medium">Get an instant ATS score and AI-driven feedback to improve your resume.</p>
      </div>

      {!analysis && (
        <div className="glassmorphism rounded-2xl p-8 border border-white/10 shadow-xl">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="relative group">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full border-2 border-dashed ${resumeFile ? 'border-primary-500 bg-primary-500/10' : 'border-gray-600 bg-dark-800/50 group-hover:border-primary-400 group-hover:bg-dark-800'} rounded-2xl p-12 transition-all flex flex-col items-center justify-center gap-4`}>
                {resumeFile ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                      <CheckCircle2 className="w-8 h-8 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{resumeFile.name}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-dark-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-gray-700">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg mb-1">Click or drag your resume here</p>
                      <p className="text-gray-500 text-sm font-medium">PDF formats only (max 5MB)</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="text-red-400 font-medium text-sm bg-red-900/20 py-2 rounded-lg border border-red-500/30">{error}</div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!resumeFile || loading}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg disabled:shadow-none border border-transparent disabled:border-gray-700"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Analyze Resume <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      )}

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 glassmorphism rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold mb-4 text-white">ATS Match Score</h3>
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  data={[{ name: 'Score', value: analysis.atsScore, fill: analysis.atsScore > 75 ? '#4ade80' : '#fbbf24' }]} 
                  startAngle={90} 
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} clockWise dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-extrabold text-white">{analysis.atsScore}</span>
                <span className="text-sm text-gray-400 font-medium">/ 100</span>
              </div>
            </div>
            <p className="mt-6 text-gray-300 text-sm leading-relaxed font-medium">{analysis.summary}</p>
            <button 
              onClick={() => {setAnalysis(null); setResumeFile(null);}} 
              className="mt-6 text-primary-400 hover:text-primary-300 text-sm font-bold transition-colors"
            >
              Analyze Another Resume
            </button>
          </div>

          <div className="col-span-2 space-y-6">
            <div className="glassmorphism rounded-2xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 font-medium">
                    <span className="text-green-400 mt-1">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glassmorphism rounded-2xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 font-medium">
                    <span className="text-red-400 mt-1">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glassmorphism rounded-2xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-lg font-bold text-blue-400 mb-4">Recommended Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((kw, i) => (
                  <span key={i} className="bg-blue-900/30 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ResumeAnalyzerPage;
