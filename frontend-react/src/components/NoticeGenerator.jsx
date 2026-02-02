import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { Bolt, Mic, Terminal as TerminalIcon } from 'lucide-react';

const NoticeGenerator = ({ onGenerate }) => {
    const [formData, setFormData] = useState({
        sender: '',
        receiver: '',
        complaint: ''
    });
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

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
                onGenerate(result.notice); // Pass result to parent
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
        <div className="glass-panel glow max-w-3xl w-full p-8 md:p-12 relative overflow-hidden mx-auto border border-white/10 rounded-xl bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(255,191,0,0.1)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

            {/* Scanning Line Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,1)] animate-[scan_3s_linear_infinite]"></div>

            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="mr-3">⚖️</span> AI NOTICE GENERATOR
            </h2>

            <div className="space-y-6">
                {/* 1. Form Section */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-amber-500 font-mono">SENDER (YOU)</label>
                        <input
                            type="text"
                            name="sender"
                            value={formData.sender}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-gray-600 rounded p-3 text-white focus:border-amber-500 focus:outline-none placeholder-gray-600"
                            placeholder="e.g. Rahul Sharma"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-amber-500 font-mono">RECEIVER (OPPONENT)</label>
                        <input
                            type="text"
                            name="receiver"
                            value={formData.receiver}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-gray-600 rounded p-3 text-white focus:border-amber-500 focus:outline-none placeholder-gray-600"
                            placeholder="e.g. Landlord / HDFC Bank"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-amber-500 font-mono">COMPLAINT DETAILS</label>
                        <textarea
                            name="complaint"
                            rows="4"
                            value={formData.complaint}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-gray-600 rounded p-3 text-white focus:border-amber-500 focus:outline-none placeholder-gray-600"
                            placeholder="Describe the issue (e.g., Security deposit not returned)..."
                        ></textarea>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-4 mt-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-mono tracking-wider"
                    >
                        {loading ? <span className="animate-spin mr-2">⚙️</span> : <Bolt className="mr-2" />}
                        {loading ? 'GENERATING...' : 'GENERATE NOTICE NOW'}
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-2 font-mono">
                        Note: Requires legal backend connection
                    </p>
                </div>

                {/* 2. Voice Button */}
                <div className="text-center">
                    <button className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg shadow-lg flex items-center justify-center transition-all">
                        <Mic className="mr-2" /> USE VOICE (HINDI/ENGLISH)
                    </button>
                    <p className="text-xs opacity-60 mt-2 text-gray-400">
                        <span className="mr-2">♿</span> Accessible to everyone, no typing required
                    </p>
                </div>

                {/* 3. Chat Button */}
                <div className="text-center">
                    <button onClick={() => window.open('/dashboard/chat', '_blank')} className="w-full py-3 border border-amber-500 text-amber-500 hover:bg-amber-500/10 font-bold rounded-lg flex items-center justify-center transition-all font-mono">
                        <TerminalIcon className="mr-2" /> LEGAL AI CHAT (कानूनी सहायता)
                    </button>
                    <p className="text-xs opacity-60 mt-2 text-gray-400">
                        <span className="mr-2">🌐</span> हिंदी/English // Voice or Text support
                    </p>
                </div>

                {/* Logs Display */}
                {logs.length > 0 && (
                    <div className="mt-4 p-4 bg-black/50 rounded font-mono text-xs text-green-400 h-32 overflow-y-auto border border-white/10">
                        {logs.map((log, idx) => (
                            <div key={idx}>{log}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoticeGenerator;
