import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Code, Mic, BarChart, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-dark-950 text-white">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-blob animation-delay-2000 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Bot className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Interview<span className="text-primary-500">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-gray-300 font-medium">
          <a href="#features" className="hover:text-primary-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary-400 transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-primary-400 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-300 hover:text-white font-bold transition-colors">Log in</Link>
          <Link to="/register" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism mb-8 border border-white/10 shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-bold text-gray-200">Llama 3 Powered AI Engine Active</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6"
        >
          Master Your Next Interview with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-500">Superhuman AI</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed font-medium"
        >
          Experience hyper-realistic voice and coding interviews. Upload your resume, select your tech stack, and get real-time feedback from our advanced AI interviewer.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Link to="/register" className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full font-bold text-white overflow-hidden shadow-[0_10px_30px_rgba(0,210,255,0.3)] transition-all hover:scale-105 border border-transparent">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-500 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              Start Mock Interview <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link to="/login" className="px-8 py-4 rounded-full glassmorphism font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center border border-white/10 shadow-lg">
            View Live Demo
          </Link>
        </motion.div>

        {/* Feature Cards Preview */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-6xl"
        >
          {[
            { icon: <Mic className="w-8 h-8 text-primary-400" />, title: "Voice Interaction", desc: "Talk naturally with our AI. It listens, processes, and responds like a real human." },
            { icon: <Code className="w-8 h-8 text-blue-400" />, title: "Live Code Execution", desc: "Solve DSA and system design problems in our integrated IDE with instant AI review." },
            { icon: <BarChart className="w-8 h-8 text-purple-400" />, title: "Deep Analytics", desc: "Track your progress with detailed reports on communication, accuracy, and logic." }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeIn}
              className="glassmorphism p-8 rounded-2xl text-left hover:shadow-2xl transition-all hover:-translate-y-2 group border border-white/5 hover:border-white/20 bg-dark-900/40"
            >
              <div className="w-14 h-14 rounded-xl bg-dark-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
