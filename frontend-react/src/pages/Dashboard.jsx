import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, MessageSquare } from 'lucide-react';

// Components
import NoticeGenerator from '../components/NoticeGenerator';
import ChatTerminal from '../components/ChatTerminal';
import ResultsPanel from '../components/ResultsPanel';

const Dashboard = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState('generator'); // 'generator', 'results'
    const [noticeResult, setNoticeResult] = useState(null);
    const [showChat, setShowChat] = useState(false);

    // Auth Guard
    if (!loading && !user) {
        navigate('/');
        return null;
    }

    const handleLogout = () => {
        auth.signOut();
        navigate('/');
    };

    const handleNoticeGenerated = (result) => {
        setNoticeResult(result);
        setCurrentView('results');
    };

    const handleReset = () => {
        setNoticeResult(null);
        setCurrentView('generator');
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden relative">
            <div className="fixed inset-0 grid-background opacity-20 pointer-events-none"></div>

            {/* Navbar */}
            <nav className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-xl font-bold tracking-wider text-amber-500">NYAYA-SAHAYAK DASHBOARD</div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center text-sm text-gray-400">
                            <User size={16} className="mr-2" />
                            {user?.email}
                        </div>
                        <button
                            onClick={() => setShowChat(true)}
                            className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/80 transition-all flex items-center"
                        >
                            <MessageSquare size={16} className="mr-2" /> AI ASSISTANT
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12 relative z-10">
                <div className="animate-fade-in">
                    {currentView === 'generator' && (
                        <div className="flex flex-col items-center">
                            <div className="text-center mb-12">
                                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    Legal First Responder
                                </h1>
                                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                    Generate legally sound notices, analyze contracts, and get instant guidance powered by Gemini AI.
                                </p>
                            </div>

                            <NoticeGenerator onGenerate={handleNoticeGenerated} />
                        </div>
                    )}

                    {currentView === 'results' && (
                        <ResultsPanel noticeContent={noticeResult} onReset={handleReset} />
                    )}
                </div>
            </main>

            {/* Chat Terminal Overlay */}
            {showChat && (
                <ChatTerminal onClose={() => setShowChat(false)} />
            )}
        </div>
    );
};

export default Dashboard;
