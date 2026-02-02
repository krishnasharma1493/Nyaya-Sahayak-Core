/**
 * NYAYA-SAHAYAK LEGAL CONSOLE - JavaScript
 * PDF.js Integration, RAG Chat, Contract Verification
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const ConsoleState = {
    pdfDoc: null,
    currentPage: 1,
    totalPages: 0,
    zoomLevel: 1.0,
    uploadedFile: null,
    isProcessing: false
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    uploadZone: document.getElementById('upload-zone'),
    legalNoticeForm: document.getElementById('legal-notice-form'),
    senderInput: document.getElementById('sender-name'),
    receiverInput: document.getElementById('receiver-name'),
    complaintInput: document.getElementById('complaint-text'),
    generateNoticeBtn: document.getElementById('btn-generate-notice'),

    fileInput: document.getElementById('file-input'), // Kept for backend compatibility/future
    pdfDisplay: document.getElementById('pdf-display'),
    pdfCanvas: document.getElementById('pdf-canvas'),
    pdfPageNum: document.getElementById('pdf-page-num'),
    pdfPageCount: document.getElementById('pdf-page-count'),
    pdfPrevBtn: document.getElementById('pdf-prev'),
    pdfNextBtn: document.getElementById('pdf-next'),
    pdfZoomInBtn: document.getElementById('pdf-zoom-in'),
    pdfZoomOutBtn: document.getElementById('pdf-zoom-out'),
    analysisOutput: document.getElementById('analysis-output'),
    legalQueryInput: document.getElementById('legal-query-input'),
    verifyContractBtn: document.getElementById('verify-contract-btn'),
    clearAnalysisBtn: document.getElementById('clear-analysis-btn'),
    newQueryBtn: document.getElementById('new-query-btn'),
    systemTime: document.getElementById('system-time')
};

// ============================================
// INITIALIZATION
// ============================================

// Update system time
function updateSystemTime() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    elements.systemTime.textContent = `${dateStr} ${timeStr}`;
}

setInterval(updateSystemTime, 1000);
updateSystemTime();

// ============================================
// PDF VIEWER FUNCTIONALITY
// ============================================

// Configure PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// File upload handling
elements.fileInput.addEventListener('change', handleFileUpload);

elements.uploadZone.addEventListener('click', () => {
    elements.fileInput.click();
});

// Drag and drop
elements.uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadZone.style.borderColor = 'var(--neon-gold)';
});

elements.uploadZone.addEventListener('dragleave', () => {
    elements.uploadZone.style.borderColor = 'var(--dim-amber)';
});

elements.uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadZone.style.borderColor = 'var(--dim-amber)';

    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileUploadWithFile(file);
    }
});

// LEGAL NOTICE GENERATOR LOGIC
if (elements.generateNoticeBtn) {
    elements.generateNoticeBtn.addEventListener('click', async () => {
        const sender = elements.senderInput.value.trim();
        const receiver = elements.receiverInput.value.trim();
        const complaint = elements.complaintInput.value.trim();

        if (!sender || !receiver || !complaint) {
            addAnalysisBlock('[ERROR]', 'Please fill in all fields (Sender, Receiver, Complaint).', 'dim');
            return;
        }

        elements.generateNoticeBtn.disabled = true;
        elements.generateNoticeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> DRAFTING...';

        // Show indicator in terminal
        addAnalysisBlock('[SYSTEM]', 'Received Complaint Details. Initiating Legal Drafting Sequence...', 'amber');
        const thinking = new LegalThinkingIndicator('analysis-output');
        thinking.start();

        try {
            const response = await fetch('/api/draft-notice/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender, receiver, complaint })
            });

            const result = await response.json();
            thinking.stop();

            if (result.success) {
                addAnalysisBlock('[SUCCESS]', 'Legal Notice generated successfully! Opening Preview...', 'amber');
                openNoticeModal(result.notice);
            } else {
                addAnalysisBlock('[ERROR]', result.error || 'Drafting failed', 'dim');
            }

        } catch (e) {
            thinking.stop();
            addAnalysisBlock('[ERROR]', `Network Error: ${e.message}`, 'dim');
        }

        elements.generateNoticeBtn.disabled = false;
        elements.generateNoticeBtn.innerHTML = '<i class="fas fa-bolt"></i> GENERATE LEGAL NOTICE';
    });
}

// Modal Functions
window.openNoticeModal = function (markdownText) {
    const modal = document.getElementById('notice-preview-modal');
    const content = document.getElementById('notice-content');

    // Simple markdown formatting for display
    let html = markdownText
        .replace(/^# (.*$)/gim, '<h1 style="text-align:center; text-transform:uppercase; border-bottom: 2px solid #000; padding-bottom:10px;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\n/gim, '<br>');

    content.innerHTML = html;
    modal.classList.remove('hidden');
}

window.closeNoticeModal = function () {
    document.getElementById('notice-preview-modal').classList.add('hidden');
}

window.copyNoticeText = function () {
    const text = document.getElementById('notice-content').innerText;
    navigator.clipboard.writeText(text).then(() => alert('Notice copied to clipboard!'));
}

window.downloadNoticePDF = function () {
    alert("PDF Download feature coming soon in Phase 3!");
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        handleFileUploadWithFile(file);
    }
}

async function handleFileUploadWithFile(file) {
    console.log('File selected:', file.name, 'Size:', file.size, 'bytes');

    ConsoleState.uploadedFile = file;

    // Show processing message
    addAnalysisBlock('[FILE UPLOAD]', `✅ Processing: ${file.name}...`, 'amber');

    if (file.type === 'application/pdf') {
        await loadPDF(file);
        addAnalysisBlock('[PDF LOADED]', `📄 ${file.name} is ready for preview and analysis`, 'amber');
    } else {
        addAnalysisBlock('[DOCUMENT LOADED]', `📄 ${file.name} ready for analysis (DOCX files don't have preview)`, 'amber');
    }

    // Enable verify button
    elements.verifyContractBtn.disabled = false;

    addAnalysisBlock('[READY]', '🔍 Document loaded successfully! You can now:\n• Type a query about this document below\n• Click "VERIFY CONTRACT" for full analysis', 'amber');

    console.log('✅ File upload complete - ready for hybrid mode queries');
}

async function loadPDF(file) {
    const fileReader = new FileReader();

    fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);

        try {
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            ConsoleState.pdfDoc = pdf;
            ConsoleState.totalPages = pdf.numPages;
            ConsoleState.currentPage = 1;

            // Show PDF display, hide upload zone
            elements.uploadZone.classList.add('hidden');
            elements.pdfDisplay.classList.remove('hidden');

            // Update page count
            elements.pdfPageCount.textContent = ConsoleState.totalPages;

            // Render first page
            await renderPage(1);

        } catch (error) {
            addAnalysisBlock('[ERROR]', `Failed to load PDF: ${error.message}`, 'dim');
        }
    };

    fileReader.readAsArrayBuffer(file);
}

async function renderPage(pageNum) {
    if (!ConsoleState.pdfDoc) return;

    const page = await ConsoleState.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: ConsoleState.zoomLevel });

    const canvas = elements.pdfCanvas;
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };

    await page.render(renderContext).promise;

    // Update page number
    elements.pdfPageNum.textContent = pageNum;
    ConsoleState.currentPage = pageNum;

    // Update button states
    elements.pdfPrevBtn.disabled = (pageNum <= 1);
    elements.pdfNextBtn.disabled = (pageNum >= ConsoleState.totalPages);
}

// PDF Navigation Controls
elements.pdfPrevBtn.addEventListener('click', async () => {
    if (ConsoleState.currentPage > 1) {
        await renderPage(ConsoleState.currentPage - 1);
    }
});

elements.pdfNextBtn.addEventListener('click', async () => {
    if (ConsoleState.currentPage < ConsoleState.totalPages) {
        await renderPage(ConsoleState.currentPage + 1);
    }
});

elements.pdfZoomInBtn.addEventListener('click', async () => {
    ConsoleState.zoomLevel += 0.2;
    await renderPage(ConsoleState.currentPage);
});

elements.pdfZoomOutBtn.addEventListener('click', async () => {
    if (ConsoleState.zoomLevel > 0.4) {
        ConsoleState.zoomLevel -= 0.2;
        await renderPage(ConsoleState.currentPage);
    }
});

// ============================================
// AI ANALYSIS STREAM
// ============================================

function addAnalysisBlock(prefix, text, textClass = 'amber') {
    const block = document.createElement('div');
    block.className = 'terminal-block';

    const prefixDiv = document.createElement('div');
    prefixDiv.className = 'terminal-prefix';
    prefixDiv.textContent = prefix;

    const textDiv = document.createElement('div');
    textDiv.className = `terminal-text ${textClass}`;
    textDiv.innerHTML = text;

    block.appendChild(prefixDiv);
    block.appendChild(textDiv);

    elements.analysisOutput.appendChild(block);

    // Auto-scroll to bottom
    elements.analysisOutput.scrollTop = elements.analysisOutput.scrollHeight;
}

async function streamTypingEffect(prefix, text, textClass = 'amber') {
    const block = document.createElement('div');
    block.className = 'terminal-block';

    const prefixDiv = document.createElement('div');
    prefixDiv.className = 'terminal-prefix';
    prefixDiv.textContent = prefix;

    const textDiv = document.createElement('div');
    textDiv.className = `terminal-text ${textClass}`;

    block.appendChild(prefixDiv);
    block.appendChild(textDiv);

    elements.analysisOutput.appendChild(block);

    // Typing effect
    let currentText = '';
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    textDiv.appendChild(cursor);

    for (let i = 0; i < text.length; i++) {
        currentText += text[i];
        textDiv.innerHTML = currentText;
        textDiv.appendChild(cursor);

        // Auto-scroll
        elements.analysisOutput.scrollTop = elements.analysisOutput.scrollHeight;

        await new Promise(resolve => setTimeout(resolve, 15));
    }

    cursor.remove();
}

// ==================================
// LEGAL QUERY SUBMISSION
// ==================================

// Initialize the thinking indicator
const thinkingIndicator = new LegalThinkingIndicator('analysis-output');

elements.legalQueryInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && !ConsoleState.isProcessing) {
        const query = elements.legalQueryInput.value.trim();

        if (!query) return;

        const hasUploadedFile = ConsoleState.uploadedFile !== null;

        if (query) {
            ConsoleState.isProcessing = true;
            elements.legalQueryInput.disabled = true;

            // Show user query
            addAnalysisBlock('[USER QUERY]', query, 'amber');

            // Show mode if document uploaded
            if (hasUploadedFile) {
                console.log('HYBRID MODE: File selected:', ConsoleState.uploadedFile.name);
                addAnalysisBlock('[MODE]', `🔍 ANALYZING UPLOADED DOCUMENT: ${ConsoleState.uploadedFile.name}`, 'amber');
            }

            // START DYNAMIC THINKING INDICATOR (replaces static "PROCESSING" message)
            thinkingIndicator.start();

            try {
                let response;

                if (hasUploadedFile) {
                    // HYBRID MODE: Send file + query via FormData
                    console.log('Sending query with uploaded file via FormData');

                    const formData = new FormData();
                    formData.append('file', ConsoleState.uploadedFile);
                    formData.append('query', query);  // Changed from 'message' to 'query'

                    response = await fetch('/api/chat/', {
                        method: 'POST',
                        body: formData  // NO Content-Type header - browser sets it automatically
                    });
                } else {
                    // STANDARD MODE: Send query only via JSON
                    console.log('Sending text-only query via JSON');

                    response = await fetch('/api/chat/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ query: query })  // Changed from 'message' to 'query'
                    });
                }

                const data = await response.json();

                // STOP THINKING INDICATOR
                thinkingIndicator.stop();

                if (data.success) {
                    // Stream the response with typing effect
                    await streamTypingEffect('[RAG RESPONSE]', data.response);

                    // Show metadata if available
                    if (data.metadata) {
                        addAnalysisBlock('[NOTE]', `Model: ${data.metadata.model} | Method: ${data.metadata.method}`, 'dim');
                    }

                } else {
                    addAnalysisBlock('[ERROR]', data.error || data.message || 'Query failed', 'dim');
                }

            } catch (error) {
                console.error('Chat API error:', error);

                // STOP THINKING INDICATOR ON ERROR
                thinkingIndicator.stop();

                addAnalysisBlock('[ERROR]', `Connection failed: ${error.message}`, 'dim');
            }

            // Re-enable input and clear query
            ConsoleState.isProcessing = false;
            elements.legalQueryInput.disabled = false;
            elements.legalQueryInput.value = '';
            elements.legalQueryInput.focus();
        }
    }
});

// ============================================
// CONTRACT VERIFICATION
// ============================================

elements.verifyContractBtn.addEventListener('click', async () => {
    if (!ConsoleState.uploadedFile) {
        addAnalysisBlock('[ERROR]', 'No file uploaded. Upload a contract first.', 'dim');
        return;
    }

    ConsoleState.isProcessing = true;
    elements.verifyContractBtn.disabled = true;

    // Start thinking indicator
    addAnalysisBlock('[SYSTEM]', 'Initiating Legal Audit Protocol...', 'amber');

    // Create a specific loading block
    const loadingBlock = document.createElement('div');
    loadingBlock.className = 'terminal-block';
    loadingBlock.innerHTML = `
        <div class="terminal-prefix">[ANALYZING]</div>
        <div class="terminal-text amber pulse-text">
            Scanning contract for legal risks and missing clauses...
        </div>
    `;
    elements.analysisOutput.appendChild(loadingBlock);
    elements.analysisOutput.scrollTop = elements.analysisOutput.scrollHeight;

    try {
        const formData = new FormData();
        formData.append('file', ConsoleState.uploadedFile);

        const response = await fetch('/api/verify-document/', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        // Remove loading block
        loadingBlock.remove();

        if (result.success) {
            // Format Markdown to HTML for terminal display
            let formattedReport = result.analysis
                .replace(/^# (.*$)/gim, '<h3>$1</h3>') // H1
                .replace(/^## (.*$)/gim, '<br><strong style="color:#FFA500; font-size:1.1em">$1</strong>') // H2
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>') // Bold
                .replace(/\n/gim, '<br>'); // Newlines

            addAnalysisBlock('[LEGAL AUDIT REPORT]', formattedReport, 'amber');

        } else {
            addAnalysisBlock('[ERROR]', result.error || 'Verification failed', 'dim');
        }

    } catch (error) {
        if (typeof loadingBlock !== 'undefined') loadingBlock.remove();
        addAnalysisBlock('[ERROR]', `Verification failed: ${error.message}`, 'dim');
    }

    ConsoleState.isProcessing = false;
    elements.verifyContractBtn.disabled = false;
});

// ============================================
// ACTION BUTTONS
// ============================================

elements.clearAnalysisBtn.addEventListener('click', () => {
    elements.analysisOutput.innerHTML = `
        <div class="terminal-block">
            <div class="terminal-prefix">[SYSTEM RESET]</div>
            <div class="terminal-text amber">
                Analysis stream cleared. Ready for new query.
            </div>
        </div>
    `;
});

elements.newQueryBtn.addEventListener('click', () => {
    elements.legalQueryInput.focus();
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Clear analysis
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.clearAnalysisBtn.click();
    }

    // Ctrl/Cmd + N: New query (focus input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        elements.legalQueryInput.focus();
    }

    // ESC: Clear input
    if (e.key === 'Escape') {
        elements.legalQueryInput.value = '';
    }
});

// ============================================
// INITIALIZATION COMPLETE
// ============================================

console.log('═══════════════════════════════════════════════════════════');
console.log('NYAYA-SAHAYAK LEGAL CONSOLE v2.0 - INITIALIZED');
console.log('Terminal Aesthetic: ACTIVE');
console.log('RAG Engine: CONNECTED');
console.log('Contract Verification: READY');
console.log('═══════════════════════════════════════════════════════════');
