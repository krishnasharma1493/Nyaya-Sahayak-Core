import React, { useState } from 'react';
import { LogOut, Shield, Bolt, Mic, Terminal as TerminalIcon } from 'lucide-react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const MainDashboard = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        sender: '',
        receiver: '',
        complaint: ''
    });
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    const handleLogout = () => {
        auth.signOut();
        navigate('/');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addLog = (text) => {
        setLogs(prev => [...prev, text]);
    };

    const handleGenerate = async () => {
        if (!formData.sender || !formData.receiver || !formData.complaint) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        setLogs([]);
        addLog('[01] Initiating Notice Drafter Protocol...');
        addLog(`[02] Sender: ${formData.sender} | Receiver: ${formData.receiver}`);
        addLog('[03] Analyzing Complaint Details...');

        try {
            const response = await fetch(`${API_BASE_URL}/api/draft-notice/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            addLog('[04] Contacting Legal AI Core (Gemini)...');
            const result = await response.json();

            if (result.success) {
                addLog('[05] Drafting Complete. Verify/Sign.');
                console.log(result.notice); // Placeholder for handling result
            } else {
                addLog(`[ERROR] ${result.error}`);
            }
        } catch (e) {
            addLog(`[CRITICAL ERROR] ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500 rounded-2xl p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative overflow-hidden">

                {/* Header Section */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                    <div className="flex items-center space-x-2">
                        <Shield className="text-amber-500 animate-pulse" size={24} />
                        <h1 className="text-xl font-bold tracking-widest text-white font-mono">
                            NYAYA-SAHAYAK
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-300 text-sm font-mono flex items-center"
                    >
                        <LogOut size={14} className="mr-1" /> DISCONNECT
                    </button>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-center text-amber-500 mb-8">
                    AI NOTICE GENERATOR
                </h2>

                {/* Form Section */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-amber-500 font-mono tracking-wide">SENDER (YOU)</label>
                        <input
                            type="text"
                            name="sender"
                            value={formData.sender}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                            placeholder="e.g. Rahul Sharma"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-amber-500 font-mono tracking-wide">RECEIVER (OPPONENT)</label>
                        <input
                            type="text"
                            name="receiver"
                            value={formData.receiver}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                            placeholder="e.g. Landlord / HDFC Bank"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-amber-500 font-mono tracking-wide">COMPLAINT DETAILS</label>
                        <textarea
                            name="complaint"
                            rows="4"
                            value={formData.complaint}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                            placeholder="Describe the issue (e.g., Security deposit not returned)..."
                        ></textarea>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center"
                    >
                        {loading ? <span className="animate-spin mr-2">⚙️</span> : <Bolt className="mr-2" />}
                        {loading ? 'GENERATING...' : 'GENERATE NOTICE NOW'}
                    </button>
                </div>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-800">
                    <button className="flex items-center justify-center py-3 bg-slate-800 hover:bg-slate-700 text-green-400 font-bold rounded-lg transition-all border border-green-500/30">
                        <Mic className="mr-2" size={18} /> Voice Input
                    </button>
                    <button onClick={() => window.open('/dashboard/chat', '_blank')} className="flex items-center justify-center py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg transition-all border border-amber-500/30">
                        <TerminalIcon className="mr-2" size={18} /> Legal Chat
                    </button>
                </div>

                {/* Logs Display */}
                {logs.length > 0 && (
                    <div className="mt-6 p-4 bg-black rounded font-mono text-xs text-green-400 h-32 overflow-y-auto border border-gray-800">
                        {logs.map((log, idx) => (
                            <div key={idx} className="mb-1">{log}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainDashboard;
