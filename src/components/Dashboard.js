import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, TrendingUp, Award,
  ChevronRight, Gamepad2, BookOpen,
  PieChart, Clock, Brain, FileText,
  Zap, Target, Flame, Sparkles, Scale
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const API = 'http://127.0.0.1:8000';

const Dashboard = ({ onNavigate }) => {
  const { user, fetchXPFromServer } = useUser();
  const [serverStats, setServerStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user.isLoggedIn || !user.token) return;
      setLoadingStats(true);
      try {
        const res = await fetch(`${API}/user-stats`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setServerStats(data);
          fetchXPFromServer(user.token);
        }
      } catch (e) {
        console.error('Could not fetch stats:', e);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user.isLoggedIn, user.token]);

  const xpForNextLevel = 100;
  const xpProgress = user.totalXP % xpForNextLevel;
  const xpProgressPct = (xpProgress / xpForNextLevel) * 100;

  const quickActions = [
    {
      id: 'quiz',
      title: 'Quick Quiz',
      description: 'Master the Constitution with rapid-fire questions.',
      icon: Brain,
      gradient: 'from-amber-400 to-orange-600',
      path: '/quiz',
    },
    {
      id: 'games',
      title: 'Interactive Arena',
      description: 'Engage in legal simulation games and earn XP.',
      icon: Gamepad2,
      gradient: 'from-orange-600 to-red-800',
      path: '/games',
    },
    {
      id: 'modules',
      title: 'Legal Academy',
      description: 'Structured pathways through criminal and civil law.',
      icon: BookOpen,
      gradient: 'from-stone-700 to-stone-900',
      path: '/modules',
    },
    {
      id: 'pdf-learn',
      title: 'Upload any PDF and learn law',
      description: 'Summarize case laws and generate flashcards instantly.',
      icon: FileText,
      gradient: 'from-amber-600 to-yellow-700',
      path: '/pdf-learn',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden font-sans" 
         style={{ background: 'linear-gradient(to bottom right, #fdf8f1, #f4ede4)' }}>
      
      {/* ── Animated Background Texture ── */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-200 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-200 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* ── Welcome Hero Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-orange-900/20"
        >
          <div className="p-1 bg-gradient-to-r from-amber-600 via-orange-900 to-stone-900">
            <div className="bg-stone-900/95 backdrop-blur-xl rounded-[2.4rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-500 text-xs font-bold tracking-widest uppercase">Scholar Status</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">{user.name}</span>!
                </h1>
                <p className="text-stone-400 text-lg max-w-lg">
                  You are making great progress. Only <span className="text-white font-bold">{xpForNextLevel - xpProgress} XP</span> until Level {user.currentLevel + 1}.
                </p>
                
                {/* Modern Progress Bar */}
                <div className="pt-4 max-w-md">
                  <div className="flex justify-between text-xs font-bold text-amber-500 mb-2 uppercase tracking-tighter">
                    <span>XP Progress</span>
                    <span>{xpProgressPct.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-600 to-orange-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgressPct}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Decorative Level Badge */}
              <div className="relative group">
                <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-700 p-1 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-full bg-stone-900 rounded-[1.4rem] flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{user.currentLevel}</span>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Level</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Bento Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total XP', val: user.totalXP, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/5' },
            { label: 'Achievements', val: user.achievements?.length || 0, icon: Award, color: 'text-orange-500', bg: 'bg-orange-500/5' },
            { label: 'Day Streak', val: serverStats?.streak_count ?? 0, icon: Flame, color: 'text-red-500', bg: 'bg-red-500/5' },
            { label: 'Current Rank', val: 'Scholar', icon: Scale, color: 'text-stone-400', bg: 'bg-stone-500/5' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-black text-stone-800 leading-none">{stat.val}</p>
              <p className="text-xs font-bold text-stone-400 uppercase mt-2 tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Main Content Area ── */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3">
              <Zap className="text-amber-600 fill-amber-600" size={24} />
              Quick Actions
            </h2>
            
            <div className="grid gap-4">
              {quickActions.map((action, i) => (
                <motion.div
                  key={action.id}
                  whileHover={{ x: 10 }}
                  onClick={() => onNavigate(action.path)}
                  className="group relative cursor-pointer bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:border-amber-300 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full -mr-16 -mt-16 group-hover:bg-amber-50 transition-colors" />
                  
                  <div className="relative z-10 flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg text-white transform group-hover:scale-110 transition-transform`}>
                      <action.icon size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-stone-900">{action.title}</h3>
                        {action.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-900 text-amber-400 text-[10px] font-black italic">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-500 text-sm">{action.description}</p>
                    </div>
                    <ChevronRight className="text-stone-300 group-hover:text-amber-600 group-hover:translate-x-2 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Sidebar Area ── */}
          <div className="space-y-8">
            {/* Sidebar Card: Recommendations */}
            <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl" />
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <Target className="text-amber-500" /> Recommended
               </h3>
               <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                   <p className="text-xs font-bold text-amber-500 uppercase mb-1">High Priority</p>
                   <p className="text-sm font-medium">Review: The Preamble of India</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                   <p className="text-xs font-bold text-stone-400 uppercase mb-1">Skill Path</p>
                   <p className="text-sm font-medium">New Module: Consumer Rights 101</p>
                 </div>
               </div>
            </div>

            {/* Sidebar Card: Quick Links */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-200">
               <h3 className="text-lg font-black text-stone-900 mb-6 uppercase tracking-widest text-center">Resources</h3>
               <div className="grid gap-3">
                 <button onClick={() => onNavigate('/leaderboard')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-amber-500 hover:text-white transition-all group">
                   <span className="font-bold text-sm">Leaderboard</span>
                   <Trophy size={18} className="text-amber-600 group-hover:text-white" />
                 </button>
                 <button onClick={() => onNavigate('/spin')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-amber-500 hover:text-white transition-all group">
                   <span className="font-bold text-sm">Wheel of Fortune</span>
                   <PieChart size={18} className="text-amber-600 group-hover:text-white" />
                 </button>
                 <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-50 opacity-50 cursor-not-allowed">
                   <span className="font-bold text-sm italic">Daily Challenges</span>
                   <Clock size={18} />
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
