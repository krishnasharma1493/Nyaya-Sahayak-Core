/**
 * NYAYA-SAHAYAK LEGAL TOOLS - JavaScript
 * Logic for Legal Notice Generator and other tools
 */

// Helper: Terminal Output (Simplified version of legal_console.js logic)
function addAnalysisBlock(prefix, message, colorClass = 'dim') {
    const output = document.getElementById('analysis-output');
    if (!output) return;

    const block = document.createElement('div');
    block.className = 'terminal-block'; // Relies on legal_console.css

    const time = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Simple HTML escaping for safety
    const safeMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');

    block.innerHTML = `
        <span class="timestamp" style="color:#666; margin-right:10px; font-family:'Fira Code'; font-size:0.8rem">[${time}]</span>
        <div class="terminal-prefix" style="color:var(--neon-gold); font-weight:bold; display:inline-block; margin-right:10px;">${prefix}</div>
        <div class="terminal-text ${colorClass}" style="display:inline;">${safeMessage}</div>
    `;

    output.appendChild(block);
    output.scrollTop = output.scrollHeight;
}

// Elements
const toolElements = {
    senderInput: document.getElementById('sender-name'),
    receiverInput: document.getElementById('receiver-name'),
    complaintInput: document.getElementById('complaint-text'),
    generateNoticeBtn: document.getElementById('btn-generate-notice'),
    analysisOutput: document.getElementById('analysis-output')
};

// Event Listeners
if (toolElements.generateNoticeBtn) {
    toolElements.generateNoticeBtn.addEventListener('click', async () => {
        const sender = toolElements.senderInput.value.trim();
        const receiver = toolElements.receiverInput.value.trim();
        const complaint = toolElements.complaintInput.value.trim();

        if (!sender || !receiver || !complaint) {
            addAnalysisBlock('[ERROR]', 'Please fill in all fields (Sender, Receiver, Complaint).', 'red-text'); // red-text might need css or just use style
            return;
        }

        toolElements.generateNoticeBtn.disabled = true;
        originalBtnText = toolElements.generateNoticeBtn.innerHTML;
        toolElements.generateNoticeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> DRAFTING...';

        addAnalysisBlock('[SYSTEM]', 'Received Complaint Details. Initiating Legal Drafting Sequence...', 'amber');

        // Use Thinking Indicator if available
        let thinking = null;
        if (typeof LegalThinkingIndicator !== 'undefined') {
            thinking = new LegalThinkingIndicator('analysis-output');
            thinking.start();
        }

        try {
            const response = await fetch('/api/draft-notice/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender, receiver, complaint })
            });

            const result = await response.json();

            if (thinking) thinking.stop();

            if (result.success) {
                addAnalysisBlock('[SUCCESS]', 'Legal Notice generated successfully! Opening Preview...', 'amber');
                openNoticeModal(result.notice);
            } else {
                addAnalysisBlock('[ERROR]', result.error || 'Drafting failed', 'dim');
            }

        } catch (e) {
            if (thinking) thinking.stop();
            addAnalysisBlock('[ERROR]', `Network Error: ${e.message}`, 'dim');
        }

        toolElements.generateNoticeBtn.disabled = false;
        toolElements.generateNoticeBtn.innerHTML = originalBtnText;
    });
}

// Global Modal Functions
window.openNoticeModal = function (markdownText) {
    const modal = document.getElementById('notice-preview-modal');
    const content = document.getElementById('notice-content');

    if (!modal || !content) return;

    // Markdown Formatting
    let html = markdownText
        .replace(/^# (.*$)/gim, '<h1 style="text-align:center; text-transform:uppercase; border-bottom: 2px solid #000; padding-bottom:10px;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\n/gim, '<br>');

    content.innerHTML = html;
    modal.classList.remove('hidden');
}

window.closeNoticeModal = function () {
    const modal = document.getElementById('notice-preview-modal');
    if (modal) modal.classList.add('hidden');
}

window.copyNoticeText = function () {
    const content = document.getElementById('notice-content');
    if (content) {
        navigator.clipboard.writeText(content.innerText).then(() => alert('Notice copied to clipboard!'));
    }
}

window.downloadNoticePDF = function () {
    alert("PDF Download feature coming soon in Phase 3!");
}
