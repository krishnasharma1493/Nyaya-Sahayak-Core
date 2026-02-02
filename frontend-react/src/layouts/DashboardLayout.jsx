import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { MessageSquare, FileText, LogOut, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        auth.signOut();
        navigate('/');
    };

    const navItems = [
        { to: 'chat', label: 'AI Legal Console', icon: MessageSquare },
        { to: 'tools', label: 'Notice Generator', icon: FileText },
    ];

    return (
        <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-md">
                <div className="p-6 border-b border-white/10 flex items-center">
                    <Shield className="text-amber-500 mr-3" />
                    <span className="font-bold tracking-wider text-amber-500">NYAYA-SAHAYAK</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg transition-all
                ${isActive
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}
                        >
                            <item.icon size={20} className="mr-3" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut size={20} className="mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0f172a]">
                    <span className="font-bold text-amber-500">NYAYA-SAHAYAK</span>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute inset-0 z-50 bg-[#0f172a] p-4">
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setIsMobileMenuOpen(false)}><X /></button>
                        </div>
                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) => `
                    flex items-center px-4 py-4 rounded-lg text-lg
                    ${isActive ? 'bg-amber-500/10 text-amber-500' : 'text-gray-400'}
                  `}
                                >
                                    <item.icon size={24} className="mr-4" />
                                    {item.label}
                                </NavLink>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-4 text-red-400 mt-8"
                            >
                                <LogOut size={24} className="mr-4" />
                                Sign Out
                            </button>
                        </nav>
                    </div>
                )}

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 relatives">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
