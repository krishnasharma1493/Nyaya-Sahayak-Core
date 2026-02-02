import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { Navigate } from 'react-router-dom';
import { Scale } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const [user, loading] = useAuthState(auth);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-amber-500">
                <Scale size={64} className="mb-4 animate-pulse" />
                <p className="font-mono text-sm tracking-widest text-white/50">VERIFYING CREDENTIALS...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
