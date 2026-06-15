import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Send, Play, ArrowLeft, Loader2, Bot, User, Code2, Terminal, Mic, MicOff, Volume2, VolumeX, Video, VideoOff, Clock, Activity } from 'lucide-react';

const languageVersions = {
  javascript: '18.15.0',
  python: '3.10.0',
  java: '15.0.2',
  cpp: '10.2.0'
};

const InterviewRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState('// Write your solution here...\n');
  const [language, setLanguage] = useState('javascript');
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [output, setOutput] = useState('Ready to run...');
  const [error, setError] = useState('');
  
  // Voice feature state
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);

  // New Interview Features state
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(95);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (!loading && !ending) {
      interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [loading, ending]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Webcam Effect
  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
        setCameraActive(false);
      }
    };
    enableCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
    
    // Auto-read the latest AI message if enabled
    if (aiVoiceEnabled && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        window.speechSynthesis.cancel(); // Stop any ongoing speech
        const utterance = new SpeechSynthesisUtterance(lastMsg.content.replace(/```[\s\S]*?```/g, ' [Code Block] '));
        
        utterance.onstart = () => setIsAiSpeaking(true);
        utterance.onend = () => setIsAiSpeaking(false);
        utterance.onerror = () => setIsAiSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, aiVoiceEnabled]);

  useEffect(() => {
    // Setup Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
            setConfidenceScore(prev => Math.min(100, prev + 1));
          } else {
            interimTranscript += event.results[i][0].transcript;
            if (interimTranscript.length > 50) {
              setConfidenceScore(prev => Math.max(0, prev - 0.5));
            }
          }
        }
        
        if (finalTranscript) {
          setChatInput((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
        setInterimSpeech(interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.warn("Speech recognition error:", event.error);
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onend = () => {
        if (isListeningRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Failed to restart recognition", e);
          }
        } else {
          setIsListening(false);
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      isListeningRef.current = false;
      try { recognitionRef.current?.stop(); } catch(e) {}
      setIsListening(false);
    } else {
      isListeningRef.current = true;
      try {
        recognitionRef.current?.start();
      } catch(e) {
        console.warn("Speech recognition already started.");
      }
      setIsListening(true);
    }
  };

  const handleError = (err, fallbackMsg) => {
    console.error(err);
    if (err.response && err.response.status === 401) {
      setError('Your session has expired. Please log out and log back in.');
    } else {
      setError(fallbackMsg);
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const userData = JSON.parse(userStr);
        const config = {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        };

        const res = await axios.post(`http://localhost:5000/api/interviews/${id}/start`, {}, config);
        setSession(res.data);
        setMessages(res.data.messages.filter(msg => msg.role !== 'system'));
      } catch (err) {
        handleError(err, 'Failed to load interview session. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [id]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() && !interimSpeech.trim()) return;
    
    setSending(true);
    setInterimSpeech('');
    
    // Optimistically add user message
    const userMsgContent = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsgContent }]);
    
    try {
      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr);
      const config = {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      };

      const payload = {
        answer: chatInput,
        code: ''
      };

      const res = await axios.post(`http://localhost:5000/api/interviews/${id}/answer`, payload, config);
      
      setSession(res.data);
      setMessages(res.data.messages.filter(msg => msg.role !== 'system'));
      setChatInput('');
    } catch (err) {
      handleError(err, 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const executeCode = async () => {
    if (!code || code === '// Write your solution here...\n') return null;
    setExecuting(true);
    setOutput('Sending code to execution environment...');
    
    try {
      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language: language,
        version: languageVersions[language],
        files: [{ content: code }]
      });

      const { run, compile } = response.data;
      
      let finalOutput = '';
      if (compile && compile.code !== 0) {
        finalOutput += `--- Compilation Error ---\n${compile.stderr || compile.stdout}\n`;
      }
      
      if (run) {
        finalOutput += run.output || 'Code executed successfully with no output.';
      }
      
      setOutput(finalOutput);
      return finalOutput;
    } catch (err) {
      setOutput('Error connecting to code execution engine (Piston API).');
      console.error(err);
      return 'Execution engine error.';
    } finally {
      setExecuting(false);
    }
  };

  const handleRunAndSubmit = async () => {
    const runOutput = await executeCode();
    
    if (runOutput === null) return;

    setSending(true);
    
    try {
      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr);
      const config = {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      };

      const payload = {
        language,
        code,
        output: runOutput,
      };

      const res = await axios.post(`http://localhost:5000/api/interviews/${id}/code-review`, payload, config);
      
      setSession(res.data);
      setMessages(res.data.messages.filter(msg => msg.role !== 'system'));
    } catch (err) {
      handleError(err, 'Failed to submit code for review.');
    } finally {
      setSending(false);
    }
  };

  const handleEndSession = async () => {
    setEnding(true);
    window.speechSynthesis.cancel();
    isListeningRef.current = false;
    if (isListening) recognitionRef.current?.stop();
    try {
      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr);
      const config = { headers: { Authorization: `Bearer ${userData.token}` } };
      
      await axios.post(`http://localhost:5000/api/interviews/${id}/end`, {}, config);
      navigate(`/interview/${id}/result`);
    } catch (err) {
      handleError(err, 'Failed to end interview and generate evaluation.');
      setEnding(false);
    }
  };

  if (loading || ending) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">
          {ending ? 'Generating your comprehensive report...' : 'Initializing AI Interviewer...'}
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-red-400 font-medium mb-4 glassmorphism p-6 rounded-xl border border-red-500/30 bg-red-900/20">{error}</div>
        <button onClick={() => navigate('/dashboard')} className="text-primary-400 font-bold hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col xl:flex-row gap-6 -mx-4 md:mx-0">
      
      {/* Left Panel: Realistic Interview Room (Webcam, Avatar, Chat) */}
      <div className="flex-1 flex flex-col glassmorphism border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Header & Metrics */}
        <div className="h-16 border-b border-gray-700/50 flex items-center justify-between px-6 bg-dark-900/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700/50 shadow-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-mono font-bold text-gray-200 text-sm">{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700/50 shadow-sm hidden md:flex">
              <Activity className="w-4 h-4 text-primary-400" />
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${confidenceScore > 70 ? 'bg-green-500' : confidenceScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${confidenceScore}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs font-bold text-gray-400">{Math.round(confidenceScore)}%</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                window.speechSynthesis.cancel();
                setAiVoiceEnabled(!aiVoiceEnabled);
                setIsAiSpeaking(false);
              }}
              className={`p-2 rounded-lg transition-colors ${aiVoiceEnabled ? 'bg-primary-900/30 text-primary-400' : 'bg-gray-800 text-gray-500 hover:text-white'}`}
              title={aiVoiceEnabled ? "Mute AI Voice" : "Enable AI Voice"}
            >
              {aiVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleEndSession}
              disabled={sending || executing}
              className="text-sm font-bold bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Video & Avatar Panels */}
        <div className="h-48 md:h-64 border-b border-gray-700/50 flex flex-row bg-dark-900/80 flex-shrink-0">
          {/* AI Avatar */}
          <div className="flex-1 border-r border-gray-700/50 relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-dark-800 to-dark-900">
            <div className="absolute top-3 left-3 bg-dark-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-300 shadow-sm flex items-center gap-1 border border-gray-700/50">
              <Bot className="w-3 h-3 text-primary-400" /> AI Interviewer
            </div>
            
            <div className="relative">
              {/* Soundwaves */}
              {isAiSpeaking && (
                <div className="absolute inset-0">
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 rounded-full border-2 border-primary-500/30" />
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 2, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="absolute inset-0 rounded-full border-2 border-primary-400/20" />
                </div>
              )}
              
              <motion.div 
                animate={isAiSpeaking ? { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] } : {}} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-full border-4 border-gray-700 shadow-xl flex items-center justify-center relative z-10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-blue-400/20" />
                <Bot className={`w-12 h-12 md:w-16 md:h-16 ${isAiSpeaking ? 'text-primary-400' : 'text-gray-500'} transition-colors duration-500`} />
              </motion.div>
            </div>
          </div>
          
          {/* User Webcam */}
          <div className="flex-1 relative overflow-hidden bg-gray-900 flex items-center justify-center">
            <div className="absolute top-3 left-3 bg-dark-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-300 shadow-sm flex items-center gap-1 z-20 border border-gray-700/50">
              <User className="w-3 h-3 text-green-400" /> You
            </div>
            
            {/* Always render video to ensure stream binds, hide with opacity/zIndex if not active */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${cameraActive ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {!cameraActive && (
              <div className="flex flex-col items-center text-gray-600 z-10">
                <VideoOff className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-medium">Camera Disabled</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Transcript / Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-dark-900/50 relative">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-primary-600' : 'bg-gray-800 border border-gray-700'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-primary-400" />}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${msg.role === 'user' ? 'bg-primary-600/20 border border-primary-500/30 text-white' : 'bg-gray-800/80 border border-gray-700/50 text-gray-200'}`}>
                <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {sending && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 shadow-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-400" />
              </div>
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl px-5 py-4 flex items-center gap-2 shadow-md">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Controls / Chat Input */}
        <div className="p-4 border-t border-gray-700/50 bg-dark-900/80 flex flex-col gap-2 flex-shrink-0">
          {interimSpeech && (
            <div className="text-primary-400 italic text-sm px-2 animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              "{interimSpeech}"
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Speak or type your answer..."
              className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none h-[52px]"
              rows={1}
            />
            <button
              onClick={toggleListening}
              disabled={sending}
              className={`w-[52px] h-[52px] flex items-center justify-center rounded-xl transition-colors disabled:opacity-50 ${isListening ? 'bg-red-900/40 text-red-400 border border-red-500/30 shadow-inner' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white shadow-sm'}`}
              title={isListening ? "Stop Listening" : "Start Voice Typing"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSendMessage}
              disabled={sending}
              className="w-[52px] h-[52px] flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-colors disabled:opacity-50 shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Code Editor & Terminal */}
      <div className="flex-1 flex flex-col glassmorphism border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl hidden md:flex">
        {/* Editor Header */}
        <div className="h-16 border-b border-gray-700/50 flex items-center justify-between px-4 bg-dark-900/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            
            <div className="flex items-center gap-2 bg-gray-800/80 rounded-lg px-2 py-1.5 border border-gray-700/50 shadow-sm">
              <Code2 className="w-4 h-4 text-gray-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm text-gray-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={executeCode}
              disabled={executing || sending}
              className="flex items-center gap-2 text-xs font-bold bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              {executing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
              Run Code
            </button>
            <button 
              onClick={handleRunAndSubmit}
              disabled={sending || executing}
              className="flex items-center gap-2 text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-lg transition-colors disabled:opacity-50 shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              Submit for Review
            </button>
          </div>
        </div>
        
        {/* Monaco Editor */}
        <div className="flex-[2] relative border-b border-gray-700/50 bg-dark-950">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
            }}
          />
        </div>
        
        {/* Terminal Output */}
        <div className="flex-1 bg-dark-900/80 flex flex-col overflow-hidden min-h-[150px]">
          <div className="h-10 bg-gray-900 border-b border-gray-700/50 flex items-center px-4 flex-shrink-0">
            <span className="text-xs font-mono font-bold text-gray-400 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Execution Output
            </span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-gray-300 whitespace-pre-wrap">
            {output}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoomPage;
