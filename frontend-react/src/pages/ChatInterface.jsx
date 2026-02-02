import React from 'react';
import ChatTerminal from '../components/ChatTerminal';

// Since ChatTerminal was originally designed as a modal/overlay, 
// we'll adapt it here to fit inline or keep it as a full-screen feature.
// For this design, we will render a container that launches or embeds it.

const ChatInterface = () => {
    // For now, we can reuse the ChatTerminal logic, but perhaps modified 
    // to be "always visible" rather than a modal if desired. 
    // Given the component design, let's wrap it to look integrated.

    // NOTE: ChatTerminal has a close button 'onClose'. In dashboard info mode,
    // we might want to hide that or make it redirect to dashboard home. 
    // For now, we'll just render it "inline" by removing the fixed overlay constraints in a future refactor,
    // or simply utilizing it as is.

    // Simulating "always open" by passing a dummy onClose
    return (
        <div className="h-[calc(100vh-100px)]">
            {/* We might need to refactor ChatTerminal to not be fixed-position if used here */}
            {/* For this MVP, let's create a wrapper that centers it */}
            <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/10 overflow-hidden relative">
                <ChatTerminal onClose={() => { }} />
                {/* Note: The fixed positioning in ChatTerminal might overlap the sidebar. 
                    We should ideally pass a prop to ChatTerminal to disable 'fixed inset-0'.
                    However, per instructions, I will assume the component handles itself or I'll override CSS locally if needed.
                */}
            </div>

            {/* Quick Fix Style Override to make ChatTerminal relative within this container */}
            <style>{`
                .fixed.inset-0.z-50 {
                    position: absolute !important;
                    background-color: transparent !important;
                    backdrop-filter: none !important;
                }
            `}</style>
        </div>
    );
};

export default ChatInterface;
