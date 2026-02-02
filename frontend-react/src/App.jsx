import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Components & Layouts
import ConstitutionIntro from './components/intro/ConstitutionIntro';
import DashboardLayout from './layouts/DashboardLayout';
import MainDashboard from './components/MainDashboard';
import LandingPage from './pages/LandingPage';

// Pages
import ChatInterface from './pages/ChatInterface';
import ToolsInterface from './pages/ToolsInterface';

function App() {
    const [introFinished, setIntroFinished] = useState(false);

    return (
        <Router>
            <Routes>
                {/* ROUTE 1: THE GATEWAY (Public) */}
                <Route path="/" element={
                    <PublicRoute>
                        {!introFinished ? (
                            <ConstitutionIntro onComplete={() => setIntroFinished(true)} />
                        ) : (
                            <LandingPage />
                        )}
                    </PublicRoute>
                } />

                {/* ROUTE 2: THE PROTECTED APP (Dashboard) */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <MainDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/chat" element={
                    <ProtectedRoute>
                        <ChatInterface />
                    </ProtectedRoute>
                } />

                {/* Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
