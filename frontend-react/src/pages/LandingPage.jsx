import React from 'react';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { Shield, Lock, FileText, Globe, Scale } from 'lucide-react';
import '../LandingPage.css';

const LandingPage = () => {
    const [user, loading] = useAuthState(auth);

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white">Loading...</div>;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 50 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div className="landing-page">
            {/* 1. Sticky Navbar */}
            <nav className="navbar">
                <div className="container nav-content">
                    <div className="logo t-gold">NYAYA-SAHAYAK</div>
                    <ul className="nav-links">
                        <li><a href="#mission">Mission</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#faq">FAQ</a></li>
                    </ul>
                    <button className="btn-primary" onClick={handleLogin}>
                        LOGIN / GET STARTED
                    </button>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="hero">
                <div className="container hero-grid">
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1>Justice Should Be A Right, Not A Privilege.</h1>
                        <p>AI-powered legal drafting, document analysis, and instant rights awareness. Zero cost. Zero jargon.</p>
                        <button className="btn-primary" onClick={handleLogin}>
                            Access Legal Aid &gt;
                        </button>
                    </motion.div>
                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Scale className="justice-scale" />
                    </motion.div>
                </div>
            </section>

            {/* 3. Trust Bar */}
            <div className="trust-bar">
                <div className="container trust-wrapper">
                    <div className="trust-item"><Shield size={18} /> 256-Bit SSL Encryption</div>
                    <div className="trust-item"><Lock size={18} /> Private & Confidential</div>
                    <div className="trust-item"><FileText size={18} /> ISO Standard Drafting</div>
                    <div className="trust-item"><Globe size={18} /> Made for India</div>
                </div>
            </div>

            {/* 4. How It Works */}
            <motion.section
                className="section"
                id="features"
                {...fadeInUp}
            >
                <div className="container">
                    <h2 className="section-title">How It <span className="t-gold">Works</span></h2>
                    <div className="steps-grid">
                        {[
                            { title: 'Upload', desc: 'Drop your notice, contract, or bill.', num: '01' },
                            { title: 'Analyze', desc: 'Our AI detects loopholes and violations.', num: '02' },
                            { title: 'Resolve', desc: 'Generate a legal reply or notice in seconds.', num: '03' }
                        ].map((step, idx) => (
                            <motion.div
                                key={idx}
                                className="step-card"
                                whileHover={{ y: -10 }}
                            >
                                <div className="step-number">{step.num}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* 5. Know Your Rights */}
            <motion.section
                className="section"
                {...fadeInUp}
            >
                <div className="container">
                    <h2 className="section-title">Know Your <span className="t-gold">Rights</span></h2>
                    <div className="rights-scroller">
                        {[
                            { title: 'Landlord Harassment', desc: 'Protection against illegal eviction and deposit deduction.' },
                            { title: 'Consumer Fraud', desc: 'Rights under Consumer Protection Act 2019.' },
                            { title: 'FIR Registration', desc: 'Police cannot refuse to register an FIR for cognizable offenses.' },
                            { title: 'Workplace Rights', desc: 'Protection against discrimination and harassment.' },
                            { title: 'RTI', desc: 'Right to Information Act empowers citizens.' }
                        ].map((right, idx) => (
                            <div key={idx} className="rights-card">
                                <h4>{right.title}</h4>
                                <p>{right.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* 6. FAQ Accordion */}
            <motion.section
                className="section"
                id="faq"
                {...fadeInUp}
            >
                <div className="container">
                    <h2 className="section-title">Frequency Asked <span className="t-gold">Questions</span></h2>
                    <div className="faq-grid">
                        {[
                            { q: 'Is my data shared?', a: 'No. Documents are processed in-memory and discarded.' },
                            { q: 'Is this a real lawyer?', a: 'No. It is a legal aid tool. For court representation, consult a human advocate.' },
                            { q: 'Is it free?', a: 'Yes, Nyaya-Sahayak is a free legal-tech initiative.' }
                        ].map((faq, idx) => (
                            <details key={idx} className="faq-item">
                                <summary className="faq-question">
                                    {faq.q}
                                    <span>+</span>
                                </summary>
                                <div className="faq-answer">{faq.a}</div>
                            </details>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* 7. Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">GitHub Repo</a>
                    </div>
                    <p>Designed at Faculty of Technology, University of Delhi.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
