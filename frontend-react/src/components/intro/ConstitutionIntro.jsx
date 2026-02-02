import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConstitutionIntro = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 4500); // 3.5s animation + buffer

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,191,0,0.1)_0%,_transparent_70%)]"></div>

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="text-center px-4"
                >
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold tracking-widest text-[#FFBF00] font-serif mb-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        style={{ textShadow: '0 0 20px rgba(255, 191, 0, 0.5)' }}
                    >
                        WE, THE PEOPLE OF INDIA
                    </motion.h1>

                    <motion.p
                        className="text-white/60 text-sm md:text-lg tracking-[0.5em] uppercase font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                    >
                        SOLEMNLY RESOLVE TO SECURE JUSTICE
                    </motion.p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ConstitutionIntro;
