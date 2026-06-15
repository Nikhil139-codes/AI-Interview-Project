import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';
import { LayoutDashboard, Settings, LogOut, User, Menu, FileText, Code2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Interview', path: '/setup', icon: Settings },
    { name: 'Resume Analyzer', path: '/resume', icon: FileText },
    { name: 'DSA Practice', path: '/dsa', icon: Code2 },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  if (user && user.isAdmin) {
    navItems.push({ name: 'Admin Dashboard', path: '/admin', icon: Shield });
  }

  return (
    <div className="flex h-screen bg-dark-950 text-white overflow-hidden relative">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Sidebar - Glassmorphism */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 flex-shrink-0 glassmorphism border-r border-white/10 hidden md:flex flex-col text-white z-10 my-4 ml-4 rounded-3xl overflow-hidden"
      >
        <div className="h-20 flex items-center px-6 border-b border-white/10 bg-dark-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 border border-white/10">
              <span className="font-bold text-xl text-white">AI</span>
            </div>
            <span className="font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">InterviewPro</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600/80 to-primary-500/60 text-white shadow-lg shadow-primary-500/20 border border-primary-400/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-white" />}
                <Icon className={`w-5 h-5 z-10 ${isActive ? 'text-white' : 'group-hover:text-primary-400'}`} />
                <span className="font-semibold tracking-wide z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-dark-900/40">
          <div className="flex items-center gap-3 px-4 py-3 bg-dark-800/60 rounded-xl mb-2 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center border border-white/10">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white truncate w-32">{user?.name}</span>
              <span className="text-xs text-gray-400 truncate w-32">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-bold border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-dark-950/50">
        <div className="md:hidden h-20 border-b border-white/10 flex items-center justify-between px-6 glassmorphism sticky top-0 z-20 m-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="font-bold text-xl text-white">AI</span>
            </div>
            <span className="font-bold text-xl tracking-wide text-white">InterviewPro</span>
          </div>
          <button className="p-2.5 bg-dark-800/80 rounded-xl border border-white/10 text-white hover:bg-dark-700 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
