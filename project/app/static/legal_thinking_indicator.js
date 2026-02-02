/**
 * LEGAL THINKING INDICATOR
 * Dynamic status messages during query processing (20-30s wait time)
 */

class LegalThinkingIndicator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.statusMessages = [
            { icon: '⚖️', text: 'Analyzing your query against Indian Laws...' },
            { icon: '📚', text: 'Cross-referencing with Motor Vehicles Act & IPC...' },
            { icon: '🏛️', text: 'Scanning recent Supreme Court Judgments...' },
            { icon: '🧠', text: 'Formulating valid legal strategy...' },
            { icon: '✍️', text: 'Drafting actionable advice...' },
            { icon: '📋', text: 'Finalizing legal citations...' }
        ];
        this.currentIndex = 0;
        this.intervalId = null;
        this.element = null;
    }

    /**
     * Start showing the dynamic thinking indicator
     */
    start() {
        // Create the indicator element
        this.element = document.createElement('div');
        this.element.className = 'legal-thinking-indicator';
        this.element.innerHTML = `
            <div class="thinking-icon-container">
                <svg class="thinking-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L4 7V12C4 16.42 7.16 20.44 12 21.5C16.84 20.44 20 16.42 20 12V7L12 2Z" 
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 8V12L14 14" 
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="thinking-text-container">
                <span class="thinking-emoji"></span>
                <span class="thinking-text"></span>
            </div>
        `;

        // Add to container
        if (this.container) {
            this.container.appendChild(this.element);
        }

        // Start cycling through messages
        this.updateMessage();
        this.intervalId = setInterval(() => this.updateMessage(), 3500);
    }

    /**
     * Update to next status message with fade animation
     */
    updateMessage() {
        const textElement = this.element.querySelector('.thinking-text');
        const emojiElement = this.element.querySelector('.thinking-emoji');
        const message = this.statusMessages[this.currentIndex];

        // Fade out
        textElement.style.opacity = '0';
        emojiElement.style.opacity = '0';

        setTimeout(() => {
            // Update content
            emojiElement.textContent = message.icon;
            textElement.textContent = message.text;

            // Fade in with typewriter effect
            textElement.style.opacity = '1';
            emojiElement.style.opacity = '1';

            // Move to next message
            this.currentIndex = (this.currentIndex + 1) % this.statusMessages.length;
        }, 300);
    }

    /**
     * Stop and remove the indicator
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.element) {
            // Fade out before removal
            this.element.style.opacity = '0';
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                this.element = null;
            }, 300);
        }

        this.currentIndex = 0;
    }

    /**
     * Check if indicator is currently active
     */
    isActive() {
        return this.intervalId !== null;
    }
}

// Export for use in main application
window.LegalThinkingIndicator = LegalThinkingIndicator;
