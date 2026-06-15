import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, ArrowRight, Loader2, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const dsaQuestions = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy', category: 'Arrays & Hashing' },
  { id: 2, title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stack' },
  { id: 3, title: 'Reverse Linked List', difficulty: 'Easy', category: 'Linked List' },
  { id: 4, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', category: 'Sliding Window' },
  { id: 5, title: 'Binary Search', difficulty: 'Easy', category: 'Binary Search' },
  { id: 6, title: 'Invert Binary Tree', difficulty: 'Easy', category: 'Trees' },
  { id: 7, title: 'Top K Frequent Elements', difficulty: 'Medium', category: 'Arrays & Hashing' },
  { id: 8, title: 'Product of Array Except Self', difficulty: 'Medium', category: 'Arrays & Hashing' },
  { id: 9, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', category: 'Sliding Window' },
  { id: 10, title: 'Container With Most Water', difficulty: 'Medium', category: 'Two Pointers' },
  { id: 11, title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', category: 'Binary Search' },
  { id: 12, title: 'LRU Cache', difficulty: 'Medium', category: 'Design' },
  { id: 13, title: 'Merge Intervals', difficulty: 'Medium', category: 'Intervals' },
  { id: 14, title: 'Word Search', difficulty: 'Medium', category: 'Backtracking' },
  { id: 15, title: 'Number of Islands', difficulty: 'Medium', category: 'Graphs' },
  { id: 16, title: 'Merge K Sorted Lists', difficulty: 'Hard', category: 'Linked List' },
  { id: 17, title: 'Trapping Rain Water', difficulty: 'Hard', category: 'Two Pointers' },
  { id: 18, title: 'N-Queens', difficulty: 'Hard', category: 'Backtracking' },
  { id: 19, title: 'Word Ladder', difficulty: 'Hard', category: 'Graphs' },
];

const DSADashboardPage = () => {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(null);
  const [error, setError] = useState('');

  const startDSAPractice = async (q) => {
    setStarting(q.id);
    setError('');
    
    try {
      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr);
      const config = { headers: { Authorization: `Bearer ${userData.token}` } };
      
      const payload = {
        role: `DSA Practice: ${q.title}`,
        experienceLevel: 'Practice',
        techStack: [q.category, 'Data Structures', 'Algorithms']
      };

      const res = await api.post('/api/interviews/setup', payload, config);
      navigate(`/interview/${res.data._id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to start DSA practice. Please try again.');
      setStarting(null);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
          <Code2 className="w-8 h-8 text-primary-400" />
          DSA Practice
        </h1>
        <p className="text-gray-400 font-medium">Practice top Data Structures & Algorithms questions with live AI feedback.</p>
      </div>

      {error && <div className="text-red-400 text-sm font-medium bg-red-900/20 border border-red-500/30 p-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dsaQuestions.map((q, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={q.id}
            className="glassmorphism rounded-2xl p-6 border border-white/5 hover:border-primary-500/50 hover:bg-dark-800/60 transition-all flex flex-col h-full group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${getDifficultyColor(q.difficulty)}`}>
                {q.difficulty}
              </span>
              <BrainCircuit className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{q.title}</h3>
            <p className="text-sm text-gray-400 font-medium mb-6 flex-1">Category: {q.category}</p>
            
            <button
              onClick={() => startDSAPractice(q)}
              disabled={starting !== null}
              className="w-full flex justify-center items-center gap-2 bg-dark-800 hover:bg-primary-600 text-gray-300 hover:text-white border border-gray-700 hover:border-primary-500 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {starting === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Solve Challenge <ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DSADashboardPage;
