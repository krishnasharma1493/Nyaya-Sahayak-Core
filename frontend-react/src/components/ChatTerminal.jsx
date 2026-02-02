import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { X, Send } from 'lucide-react';

const ChatTerminal = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'system', text: '⚙️ DEMO MODE - CONNECTED TO LEGAL CORE' },
        { role: 'ai', text: 'नमस्ते。 Secure legal link established. AI ready to assist. Type your query in Hindi/English.' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            const data = await response.json();

            if (data.status === 'success') {
                setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: `Error: ${data.message || 'Unknown error'}` }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', text: `Connection Error: ${e.message}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-black border border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col h-[600px] font-mono">

                {/* Header */}
                <div className="bg-black/90 p-3 border-b border-cyan-500/30 flex justify-between items-center">
                    <div className="text-cyan-400 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        NYAYA-SAHAYAK // TERMINAL v1.0
                    </div>
                    <button onClick={onClose} className="text-cyan-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-opacity-90 bg-gray-900 scrollbar-thin scrollbar-thumb-cyan-900">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] p-3 rounded ${msg.role === 'user'
                                        ? 'bg-cyan-900/30 text-cyan-100 border-l-2 border-cyan-500'
                                        : msg.role === 'ai'
                                            ? 'text-green-400'
                                            : 'text-yellow-400 text-sm'
                                    }`}
                            >
                                <div className="text-xs opacity-50 mb-1 uppercase">
                                    [{msg.role === 'user' ? 'YOU' : msg.role === 'ai' ? 'AI-LEGAL-CORE' : 'SYSTEM'}]
                                </div>
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="text-green-500 animate-pulse">AI is processing query...</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black border-t border-cyan-500/30">
                    <div className="flex items-center bg-gray-900/50 border border-cyan-500/30 rounded px-3 py-2">
                        <span className="text-cyan-500 mr-2">›</span>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent border-none outline-none text-cyan-100 placeholder-cyan-800"
                            placeholder="Type your legal query here..."
                            autoFocus
                        />
                        <button onClick={handleSend} className="text-cyan-500 hover:text-cyan-300">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatTerminal;
