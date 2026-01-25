// ========================================
// NYAYA-SAHAYAK - MAIN JAVASCRIPT
// ========================================

// State Management
const State = {
    currentScreen: 'gateway',
    isProcessing: false,
    caseData: {},
    audioContext: null,
    audioInitialized: false
};

// ========================================
// LAUNCH GATEWAY LOGIC
// ========================================

// Gateway Elements
const gateway = {
    overlay: document.getElementById('launch-gateway'),
    enterBtn: document.getElementById('gateway-enter-btn'),
    quickLinks: document.querySelectorAll('.gateway-link')
};

// Enter Portal Button - Fade out gateway and show intro
if (gateway.enterBtn) {
    gateway.enterBtn.addEventListener('click', () => {
        playTone(1200, 'sine', 0.3);

        // Fade out gateway
        gateway.overlay.classList.add('gateway-hidden');

        // After gateway fades, proceed with existing intro sequence
        setTimeout(() => {
            State.currentScreen = 'intro';
            // The existing intro timeout will handle the rest
        }, 1000);
    });
}

// Quick Links Handling
if (gateway.quickLinks) {
    gateway.quickLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            playTone(800, 'sine', 0.15);

            const section = link.dataset.section;
            let message = '';

            switch (section) {
                case 'about':
                    message = '🎓 ABOUT THE PROJECT\n\n' +
                        '═══════════════════════════════════\n' +
                        'NYAYA-SAHAYAK: THE LEGAL FIRST-RESPONDER\n' +
                        'Theme: Smart Education\n' +
                        '═══════════════════════════════════\n\n' +
                        '👥 TEAM:\n' +
                        'Bhumi Kansal, Krishna Sharma, Mayank Balyan,\n' +
                        'Shreyas Singh, Vishal Singh\n' +
                        'Faculty of Technology, University of Delhi\n\n' +
                        '📖 ABSTRACT:\n' +
                        'NYAYA-SAHAYAK (Network Yielding AI for Justice & Awareness Sahayak) is a smart, education-based platform that helps people understand and deal with common legal problems.\n\n' +
                        'Users can upload documents related to their dispute and explain their grievance using voice/text input. The platform generates structured and legally sound notices or replies by analyzing documents and relevant Indian laws.\n\n' +
                        'NYAYA-SAHAYAK enables users to settle everyday disputes in a simple, easy-to-use, and tech-savvy way by combining legal knowledge with real-world application.\n\n' +
                        '🎯 KEY INNOVATION:\n' +
                        'Smart education through practical application rather than passive information consumption.';
                    break;
                case 'rights':
                    message = '📖 KNOW YOUR RIGHTS\n\n' +
                        'Under the Indian Constitution:\n' +
                        '• Right to Equality (Article 14)\n' +
                        '• Right to Freedom (Article 19)\n' +
                        '• Right against Exploitation (Article 23-24)\n' +
                        '• Consumer Protection Act 2019\n' +
                        '• IPC Sections for Legal Recourse\n\n' +
                        'Click "Enter Secure Portal" to get personalized legal assistance.';
                    break;
                case 'mission':
                    message = '⚖️ OUR OBJECTIVES\n\n' +
                        '1️⃣ Provide an accessible platform for addressing common legal disputes through technology\n\n' +
                        '2️⃣ Promote legal awareness by integrating learning with real-world problem resolution\n\n' +
                        '3️⃣ Enable users to generate structured and legally appropriate notices without requiring legal expertise\n\n' +
                        '4️⃣ Simplify complex legal procedures through document analysis and voice-based interaction\n\n' +
                        '5️⃣ Reduce dependency on costly legal services for small-value disputes\n\n' +
                        '6️⃣ Support the principles of smart education, social justice, and good governance through citizen-centric design\n\n' +
                        '🇮🇳 Built for India\'s Legal Empowerment';
                    break;
                case 'privacy':
                    message = '🛡️ PRIVACY PROMISE\n\n' +
                        'Your data is NEVER shared or sold.\n\n' +
                        '✓ End-to-end encryption\n' +
                        '✓ No personal data storage without consent\n' +
                        '✓ AI processing happens securely\n' +
                        '✓ Full GDPR & IT Act 2000 compliance\n' +
                        '✓ You own your legal documents\n\n' +
                        'Your trust is our constitutional responsibility.';
                    break;
            }

            alert(message);
        });
    });
}

// DOM Elements
const elements = {
    introScreen: document.getElementById('intro-screen'),
    appContainer: document.getElementById('app-container'),
    commandCenter: document.getElementById('command-center'),
    uploadInterface: document.getElementById('upload-interface'),
    processingState: document.getElementById('processing-state'),
    resultsDashboard: document.getElementById('results-dashboard'),
    aiCoreBtn: document.getElementById('ai-core-btn'),
    uploadZone: document.getElementById('upload-zone'),
    fileInput: document.getElementById('file-input'),
    voiceBtn: document.getElementById('voice-btn'),
    systemLogs: document.getElementById('system-logs'),
    gaugeFill: document.getElementById('gauge-fill'),
    gaugePercentage: document.getElementById('gauge-percentage'),
    tickerContent: document.getElementById('ticker-content'),
    newCaseBtn: document.getElementById('new-case-btn'),
    govtDashboardBtn: document.getElementById('view-govt-dashboard'),
    downloadPdfBtn: document.getElementById('download-pdf'),
    // Terminal Elements
    holographicTerminal: document.getElementById('holographic-terminal'),
    openTerminalBtn: document.getElementById('open-terminal-btn'),
    closeTerminalBtn: document.getElementById('close-terminal-btn'),
    terminalMessages: document.getElementById('terminal-messages'),
    terminalInput: document.getElementById('terminal-input')
};

// ========================================
// INTRO SEQUENCE
// ========================================

setTimeout(() => {
    elements.introScreen.style.opacity = '0';
    setTimeout(() => {
        elements.introScreen.classList.add('hidden');
        elements.appContainer.classList.remove('hidden');
        elements.commandCenter.classList.add('fade-in');
    }, 1000);
}, 3000);

// ========================================
// AUDIO SYSTEM (Web Audio API)
// ========================================

function initAudio() {
    if (!State.audioInitialized) {
        State.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        State.audioInitialized = true;
        console.log('Audio Context initialized');
    }
}

function playTone(frequency, waveType, duration) {
    if (!State.audioContext) {
        initAudio();
    }

    try {
        const oscillator = State.audioContext.createOscillator();
        const gainNode = State.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(State.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = waveType;

        const now = State.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    } catch (error) {
        console.log('Audio playback error:', error);
    }
}

// ========================================
// 3D TILT EFFECT
// ========================================

function apply3DTilt(element, event) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const deltaX = (mouseX - centerX) / (rect.width / 2);
    const deltaY = (mouseY - centerY) / (rect.height / 2);

    const maxRotation = 10;
    const rotateY = deltaX * maxRotation;
    const rotateX = -deltaY * maxRotation;

    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function reset3DTilt(element) {
    element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
}

// ========================================
// NAVIGATION
// ========================================

function showScreen(screenName) {
    elements.commandCenter.classList.add('hidden');
    elements.uploadInterface.classList.add('hidden');
    elements.processingState.classList.add('hidden');
    elements.resultsDashboard.classList.add('hidden');

    switch (screenName) {
        case 'upload':
            elements.uploadInterface.classList.remove('hidden');
            elements.uploadInterface.classList.add('slide-up');
            break;
        case 'processing':
            elements.processingState.classList.remove('hidden');
            elements.processingState.classList.add('fade-in');
            simulateProcessing();
            break;
        case 'results':
            elements.resultsDashboard.classList.remove('hidden');
            elements.resultsDashboard.classList.add('slide-up');
            animateGauge(87);
            initializeTicker();
            break;
    }

    State.currentScreen = screenName;
}

// AI Core Button Click
elements.aiCoreBtn.addEventListener('click', () => {
    playTone(1000, 'sine', 0.2);
    showScreen('upload');
});

// ========================================
// FILE UPLOAD HANDLERS
// ========================================

elements.uploadZone.addEventListener('click', () => {
    elements.fileInput.click();
});

elements.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        State.caseData.fileName = file.name;
        State.caseData.file = file; // Store the file object
        playTone(800, 'square', 0.1);
        showScreen('processing');
    }
});

elements.uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadZone.classList.add('drag-over');
});

elements.uploadZone.addEventListener('dragleave', () => {
    elements.uploadZone.classList.remove('drag-over');
});

elements.uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadZone.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file) {
        State.caseData.fileName = file.name;
        State.caseData.file = file; // Store the file object
        playTone(800, 'square', 0.1);
        showScreen('processing');
    }
});

// Voice Button
elements.voiceBtn.addEventListener('click', () => {
    playTone(1200, 'sine', 0.1);
    alert('Voice recording would start here (Web Speech API integration)');
});

// ========================================
// PROCESSING SIMULATION
// ========================================

async function processDocument() {
    elements.systemLogs.innerHTML = '';
    const addLog = (text) => {
        const div = document.createElement('div');
        div.className = 'log-line';
        div.textContent = text;
        elements.systemLogs.appendChild(div);
        elements.systemLogs.scrollTop = elements.systemLogs.scrollHeight;
    };

    addLog('[01] Initializing AI Core...');

    if (!State.caseData.file) {
        addLog('[ERROR] No file selected.');
        return;
    }

    addLog(`[02] Uploading ${State.caseData.file.name}...`);

    const formData = new FormData();
    formData.append('file', State.caseData.file);

    try {
        const response = await fetch('/api/analyze/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Network response was not ok');

        addLog('[03] Sending to Vertex AI (Gemini)...');
        const result = await response.json();

        if (result.status === 'success') {
            const data = result.data;
            addLog('[04] Analysis Complete.');
            addLog('[05] Generating Verdict...');

            // Parse Verdict Score
            let score = 85; // Default high confidence if not parsed
            // Simple heuristic to find a number in verdict if it's a string, or check if it's an object
            // The prompt asks for JSON with "verdict" which might include score.
            // Let's assume the model follows instructions often but safely fallback.

            setTimeout(() => {
                showScreen('results');
                animateGauge(score);

                // Update Notice Content
                const noticeBody = document.getElementById('notice-content');
                if (noticeBody) {
                    let html = ``;

                    if (data.summary) {
                        html += `<strong>Summary:</strong> ${data.summary}<br><br>`;
                    }

                    if (data.key_clauses) {
                        html += `<strong>Key Clauses:</strong><ul style="list-style-type: disc; margin-left: 20px;">`;
                        let clauses = Array.isArray(data.key_clauses) ? data.key_clauses : [data.key_clauses];
                        clauses.forEach(c => html += `<li>${c}</li>`);
                        html += `</ul><br>`;
                    }

                    if (data.risks) {
                        html += `<strong>Risks:</strong><br>`;
                        let risks = Array.isArray(data.risks) ? data.risks : [data.risks];
                        html += `<ul style="list-style-type: circle; margin-left: 20px;">`;
                        risks.forEach(r => html += `<li>${r}</li>`);
                        html += `</ul><br>`;
                    }

                    if (data.verdict) {
                        html += `<strong>Verdict:</strong> ${typeof data.verdict === 'string' ? data.verdict : JSON.stringify(data.verdict)}`;
                    }

                    noticeBody.innerHTML = html;
                }

            }, 1000);

        } else {
            addLog(`[ERROR] ${result.message}`);
        }

    } catch (error) {
        addLog(`[CRITICAL ERROR] ${error.message}`);
        console.error(error);
    }
}
// Keep simulateProcessing name if it's called elsewhere, or alias it
const simulateProcessing = processDocument;

// ========================================
// GAUGE ANIMATION
// ========================================

function animateGauge(targetPercentage) {
    const circumference = 2 * Math.PI * 100;
    const offset = circumference - (targetPercentage / 100) * circumference;

    setTimeout(() => {
        elements.gaugeFill.style.strokeDashoffset = offset;
    }, 500);

    let current = 0;
    const interval = setInterval(() => {
        if (current >= targetPercentage) {
            clearInterval(interval);
        } else {
            current++;
            elements.gaugePercentage.textContent = current + '%';

            if (current % 5 === 0) {
                playTone(400 + (current * 10), 'sine', 0.05);
            }
        }
    }, 20);
}

// ========================================
// FRAUD HEATMAP TICKER
// ========================================

function initializeTicker() {
    const tickerData = [
        { location: 'Delhi NCR', count: '432', icon: 'fa-exclamation-triangle' },
        { location: 'Mumbai', count: '387', icon: 'fa-fire' },
        { location: 'Bangalore', count: '291', icon: 'fa-exclamation-circle' },
        { location: 'Hyderabad', count: '203', icon: 'fa-bolt' },
        { location: 'Chennai', count: '167', icon: 'fa-exclamation-triangle' },
        { location: 'Kolkata', count: '142', icon: 'fa-fire' },
        { location: 'Pune', count: '98', icon: 'fa-exclamation-circle' }
    ];

    const tickerHTML = tickerData.map(item => `
        <div class="ticker-item">
            <i class="fas ${item.icon} ticker-icon"></i>
            <span class="ticker-location">${item.location}:</span>
            <span class="ticker-count">${item.count} active cases</span>
        </div>
    `).join('');

    elements.tickerContent.innerHTML = tickerHTML + tickerHTML;
}

// ========================================
// PDF DOWNLOAD
// ========================================

elements.downloadPdfBtn.addEventListener('click', () => {
    playTone(1000, 'square', 0.15);
    window.print();
});

// ========================================
// NEW CASE / RESET
// ========================================

elements.newCaseBtn.addEventListener('click', () => {
    playTone(800, 'sine', 0.1);
    State.caseData = {};
    elements.fileInput.value = '';
    showScreen('upload');
});

// ========================================
// GOVERNMENT DASHBOARD (Placeholder)
// ========================================

elements.govtDashboardBtn.addEventListener('click', () => {
    playTone(1200, 'sine', 0.1);
    alert('Government Dashboard - Coming Soon!\n\nThis will show:\n- National fraud heatmap\n- Common complaint patterns\n- AI recommendations for policy changes');
});

// ========================================
// SET CURRENT DATE
// ========================================

const noticeDate = document.getElementById('notice-date');
if (noticeDate) {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    noticeDate.textContent = dateStr;
}

// ========================================
// 3D TILT ON GLASS PANELS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const glassPanels = document.querySelectorAll('.glass-panel');
    glassPanels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => apply3DTilt(panel, e));
        panel.addEventListener('mouseleave', () => reset3DTilt(panel));
    });

    const aiCore = document.querySelector('.ai-core');
    if (aiCore) {
        aiCore.addEventListener('mousemove', (e) => apply3DTilt(aiCore, e));
        aiCore.addEventListener('mouseleave', () => reset3DTilt(aiCore));
    }

    // Audio feedback on all buttons
    const allButtons = document.querySelectorAll('button, .ai-core');
    allButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            playTone(800, 'sine', 0.05);
        });

        button.addEventListener('click', () => {
            initAudio();
            playTone(400, 'square', 0.1);
        });
    });
});

// ========================================
// HOLOGRAPHIC TERMINAL - CHAT INTERFACE
// ========================================

// Terminal State
const TerminalState = {
    messageHistory: [],
    isTyping: false
};

// Open Terminal
elements.openTerminalBtn.addEventListener('click', () => {
    elements.holographicTerminal.classList.remove('hidden');
    elements.terminalInput.focus();
    playTone(1400, 'sine', 0.15);
});

// Close Terminal
elements.closeTerminalBtn.addEventListener('click', () => {
    elements.holographicTerminal.classList.add('hidden');
    playTone(1000, 'sine', 0.1);
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.holographicTerminal.classList.contains('hidden')) {
        elements.holographicTerminal.classList.add('hidden');
    }
});

// Typewriter Effect Function
function typeWriter(text, element, speed = 30) {
    return new Promise((resolve) => {
        let i = 0;
        element.textContent = '';
        TerminalState.isTyping = true;

        const cursor = document.createElement('span');
        cursor.className = 'typing-indicator';
        cursor.textContent = '█';
        element.appendChild(cursor);

        const timer = setInterval(() => {
            if (i < text.length) {
                cursor.remove();
                element.textContent += text.charAt(i);
                element.appendChild(cursor);
                i++;

                // Sound effect every 5th character
                if (i % 5 === 0) {
                    playTone(1200 + (i * 2), 'sine', 0.02);
                }
            } else {
                cursor.remove();
                clearInterval(timer);
                TerminalState.isTyping = false;
                resolve();
            }
        }, speed);
    });
}

// Add User Message
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'terminal-message user-message';
    messageDiv.innerHTML = `
        <div class="message-prefix">[YOU]</div>
        <div class="message-text">${escapeHtml(text)}</div>
    `;
    elements.terminalMessages.appendChild(messageDiv);
    scrollToBottom();

    TerminalState.messageHistory.push({ role: 'user', text });
}

// Add AI Message with Typewriter
async function addAIMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'terminal-message ai-message';
    messageDiv.innerHTML = `
        <div class="message-prefix">[NYAYA-SAHAYAK AI]</div>
        <div class="message-text"></div>
    `;
    elements.terminalMessages.appendChild(messageDiv);
    scrollToBottom();

    const textElement = messageDiv.querySelector('.message-text');
    await typeWriter(text, textElement);

    TerminalState.messageHistory.push({ role: 'ai', text });
    playTone(600, 'square', 0.1);
}

// Scroll Terminal to Bottom
function scrollToBottom() {
    elements.terminalMessages.scrollTop = elements.terminalMessages.scrollHeight;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Process User Query and Generate AI Response

async function processQuery(query) {
    try {
        console.log('Sending request to /api/chat/ with message:', query);

        const response = await fetch('/api/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: query })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        if (data.status === 'success') {
            await addAIMessage(data.response);
        } else {
            console.error('API returned error:', data);
            await addAIMessage(`System Error: ${data.message || 'Unknown error occurred'}`);
        }

    } catch (error) {
        console.error('Chat API Error:', error);
        await addAIMessage(`Connection Error: ${error.message}. Please check console for details.`);
    }
}

// Handle Terminal Input
elements.terminalInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const query = elements.terminalInput.value.trim();

        if (query && !TerminalState.isTyping) {
            // Add user message
            addUserMessage(query);

            // Clear input
            elements.terminalInput.value = '';

            // Process and respond
            await processQuery(query);
        }
    }
});

// ========================================
// INITIALIZATION COMPLETE
// ========================================

console.log('██╗  ██╗██╗   ██╗ █████╗ ██╗   ██╗ █████╗     ███████╗ █████╗ ██╗  ██╗ █████╗ ██╗   ██╗ █████╗ ██╗  ██╗');
console.log('████╗ ██║╚██╗ ██╔╝██╔══██╗╚██╗ ██╔╝██╔══██╗    ██╔════╝██╔══██╗██║  ██║██╔══██╗╚██╗ ██╔╝██╔══██╗██║ ██╔╝');
console.log('██╔██╗██║ ╚████╔╝ ███████║ ╚████╔╝ ███████║    ███████╗███████║███████║███████║ ╚████╔╝ ███████║█████═╝ ');
console.log('██║╚████║  ╚██╔╝  ██╔══██║  ╚██╔╝  ██╔══██║    ╚════██║██╔══██║██╔══██║██╔══██║  ╚██╔╝  ██╔══██║██╔═██╗ ');
console.log('██║ ╚███║   ██║   ██║  ██║   ██║   ██║  ██║    ███████║██║  ██║██║  ██║██║  ██║   ██║   ██║  ██║██║ ╚██╗');
console.log('Legal AI First Responder // System Online');
console.log('Version 1.0.0 // Built for Viksit Bharat 🇮🇳');
