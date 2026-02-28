import React, { useState, useEffect } from 'react';
import { db } from '../database';
import { Shield, Github, Heart, Globe, Code, Sun, Moon, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Community: React.FC = () => {
    const [userCount, setUserCount] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        db.getUsers().then(users => setUserCount(users.length)).catch(() => setUserCount(142));
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('silius_theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('silius_theme', newMode ? 'dark' : 'light');
    };

    return (
        <div className={`min-h-screen pt-32 px-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Home Button */}
            <Link 
                to="/"
                className={`fixed top-6 left-6 md:top-8 md:left-12 z-[200] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-slate-800/80 backdrop-blur-md border border-white/10' : 'bg-white/80 backdrop-blur-md border border-slate-200'}`}
            >
                <Home size={18} className="text-rose-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Ana Sayfa</span>
            </Link>
            
            {/* Theme Toggle Button */}
            <button 
                onClick={toggleTheme}
                className={`fixed top-6 right-6 md:top-8 md:right-12 z-[200] w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-90 group ${isDarkMode ? 'bg-slate-800/80 backdrop-blur-md border border-white/10' : 'bg-white/80 backdrop-blur-md border border-slate-200'}`}
            >
                {isDarkMode ? (
                    <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" />
                ) : (
                    <Moon size={20} className="text-indigo-600 group-hover:-rotate-12 transition-transform" />
                )}
            </button>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-24">
                    <h1 className="text-6xl md:text-[7rem] font-black font-outfit uppercase italic mb-8 leading-[0.9]">
                        Topluluk
                    </h1>
                    <p className="text-2xl opacity-60 font-light">
                        <span className="text-white font-bold">{userCount}</span> kişiyle büyüyen dev bir ekosistem.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Sponsor */}
                    <div className={`group relative p-12 rounded-[3rem] hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden ${isDarkMode ? 'bg-indigo-900/20 border border-white/5' : 'bg-indigo-50 border border-indigo-200'}`}>
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield size={120} />
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-600/30 group-hover:rotate-12 transition-transform duration-500">
                                <Shield size={48} className="text-white" />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-400 mb-4">Ana Sponsor</h2>
                            <a href="https://github.com/codedByCan/SpeedSmm_v3" target="_blank" className="text-5xl font-black font-outfit text-white mb-2 hover:text-indigo-400 transition-colors">
                                SpeedSmm
                            </a>
                            <span className="text-sm opacity-40 mb-8 font-mono">(Qukpanel)</span>
                            
                            <a href="https://github.com/codedByCan/SpeedSmm_v3" className="px-8 py-3 bg-white/5 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                                <Github size={16} /> Repoyu İncele
                            </a>
                        </div>
                    </div>

                    {/* Project */}
                    <div className={`group relative p-12 rounded-[3rem] hover:border-rose-500/50 transition-all cursor-pointer overflow-hidden ${isDarkMode ? 'bg-rose-900/20 border border-white/5' : 'bg-rose-50 border border-rose-200'}`}>
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Heart size={120} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-slate-100 text-slate-900 rounded-3xl flex items-center justify-center mb-8 shadow-2xl group-hover:-rotate-12 transition-transform duration-500 font-black text-4xl">
                                S
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-rose-400 mb-4">Açık Kaynak</h2>
                            <a href="https://github.com/wvwt9I0Jgh/silius_v1" target="_blank" className="text-5xl font-black font-outfit text-white mb-2 hover:text-rose-400 transition-colors">
                                Silius v1
                            </a>
                            <span className="text-sm opacity-40 mb-8 font-mono">Community Edition</span>
                            
                            <a href="https://github.com/wvwt9I0Jgh/silius_v1" className="px-8 py-3 bg-white/5 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                                <Code size={16} /> Kaynak Kodları
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Community;
