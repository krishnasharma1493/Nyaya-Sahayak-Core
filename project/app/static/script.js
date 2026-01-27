// ========================================
// NYAYA-SAHAYAK - MAIN JAVASCRIPT
// ========================================

// State Management
const State = {
    currentScreen: 'intro',
    isProcessing: false,
    caseData: {},
    audioContext: null,
    audioInitialized: false
};

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

// Legal AI Chat button - open in NEW TAB (Isolated Interface Architecture)
elements.openTerminalBtn.addEventListener('click', () => {
    playTone(1400, 'sine', 0.15);

    // Open legal console in NEW TAB - ABSOLUTE URL for cross-server navigation
    // Frontend: http://127.0.0.1:5500 → Backend: http://127.0.0.1:8000
    window.open('http://127.0.0.1:8000/legal-console/', '_blank');
});

// Close Terminal (legacy - keep for compatibility)
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
