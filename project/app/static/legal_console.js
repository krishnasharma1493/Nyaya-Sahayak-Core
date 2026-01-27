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
    fileInput: document.getElementById('file-input'),
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

// ============================================
// RAG CHAT FUNCTIONALITY
// ============================================

elements.legalQueryInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const query = elements.legalQueryInput.value.trim();

        if (query && !ConsoleState.isProcessing) {
            ConsoleState.isProcessing = true;
            elements.legalQueryInput.value = '';

            // Show user query
            addAnalysisBlock('[USER QUERY]', query, 'amber');

            // HYBRID MODE: Check if file is uploaded
            const hasUploadedFile = ConsoleState.uploadedFile !== null;

            if (hasUploadedFile) {
                console.log('HYBRID MODE: File selected:', ConsoleState.uploadedFile.name);
                addAnalysisBlock('[MODE]', `🔍 ANALYZING UPLOADED DOCUMENT: ${ConsoleState.uploadedFile.name}`, 'amber');
            }

            // Show processing indicator
            addAnalysisBlock('[PROCESSING]', hasUploadedFile ? 'Reading uploaded document and querying legal database...' : 'Querying RAG database...', 'dim');

            try {
                let response;

                if (hasUploadedFile) {
                    // HYBRID MODE: Send file + query via FormData
                    console.log('Sending query with uploaded file via FormData');

                    const formData = new FormData();
                    formData.append('file', ConsoleState.uploadedFile);
                    formData.append('message', query);

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
                        body: JSON.stringify({ message: query })
                    });
                }

                const data = await response.json();

                if (data.status === 'success') {
                    // Show mode indicator
                    if (data.has_uploaded_context) {
                        addAnalysisBlock('[SUCCESS]', '✅ Answered from uploaded document (Local Context Priority)', 'amber');
                    }

                    // Stream the response with typing effect
                    await streamTypingEffect('[RAG RESPONSE]', data.response);

                    // Show sources if available
                    if (data.sources && data.sources.length > 0) {
                        let sourcesText = '<strong>SOURCES:</strong><br>';
                        data.sources.forEach(source => {
                            sourcesText += `• ${source.filename || 'Unknown'} ${source.page ? `(Page ${source.page})` : ''}<br>`;
                        });
                        addAnalysisBlock('[CITATIONS]', sourcesText, 'dim');
                    }

                    // Show confidence
                    if (data.confidence) {
                        const confidenceEmoji = data.confidence === 'high' || data.confidence_score > 0.8 ? '🟢' : data.confidence === 'medium' ? '🟡' : '🔴';
                        addAnalysisBlock('[CONFIDENCE]', `${confidenceEmoji} ${String(data.confidence).toUpperCase()}`, 'amber');
                    }

                    // Show note if provided
                    if (data.note) {
                        addAnalysisBlock('[NOTE]', data.note, 'dim');
                    }

                } else {
                    addAnalysisBlock('[ERROR]', data.message || 'Query failed', 'dim');
                }

            } catch (error) {
                console.error('Chat API error:', error);
                addAnalysisBlock('[ERROR]', `Connection failed: ${error.message}`, 'dim');
            }

            ConsoleState.isProcessing = false;
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

    addAnalysisBlock('[CONTRACT VERIFICATION]', 'Cross-verifying against legal database...', 'amber');

    try {
        const formData = new FormData();
        formData.append('file', ConsoleState.uploadedFile);

        const response = await fetch('http://127.0.0.1:8000/api/verify-contract/', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            const data = result.data;

            // Overall compliance
            let complianceText = `<strong>OVERALL COMPLIANCE:</strong> ${data.overall_compliance}<br>`;
            complianceText += `<strong>Contract Type:</strong> ${data.contract_type}<br>`;
            complianceText += `<strong>Clauses Analyzed:</strong> ${data.total_clauses_analyzed}<br>`;
            complianceText += `<strong>Issues Found:</strong> ${data.issues_found}<br>`;
            complianceText += `<strong>Risks Identified:</strong> ${data.risks_identified}`;

            addAnalysisBlock('[COMPLIANCE REPORT]', complianceText, 'amber');

            // Discrepancies
            if (data.discrepancies.length > 0) {
                let discText = '<strong>DISCREPANCIES DETECTED:</strong><br>';
                data.discrepancies.forEach((disc, idx) => {
                    discText += `<br>${idx + 1}. ${disc.clause}:<br>`;
                    disc.issues.forEach(issue => {
                        discText += `   • ${issue}<br>`;
                    });
                });
                addAnalysisBlock('[DISCREPANCIES]', discText, 'amber');
            }

            // Risks
            if (data.risks.length > 0) {
                let riskText = '<strong>LEGAL RISKS IDENTIFIED:</strong><br>';
                data.risks.forEach((risk, idx) => {
                    riskText += `<br>${idx + 1}. [${risk.clause}]<br>   ${risk.risk}`;
                });
                addAnalysisBlock('[RISK ASSESSMENT]', riskText, 'amber');
            }

            // Clause-by-clause analysis
            if (data.clause_analysis.length > 0) {
                let clauseText = '<strong>CLAUSE-BY-CLAUSE ANALYSIS:</strong><br>';
                data.clause_analysis.forEach(clause => {
                    clauseText += `<br>• ${clause.clause}: <strong>${clause.status}</strong><br>`;
                    if (clause.recommendation) {
                        clauseText += `  Recommendation: ${clause.recommendation}<br>`;
                    }
                });
                addAnalysisBlock('[DETAILED ANALYSIS]', clauseText, 'dim');
            }

        } else {
            addAnalysisBlock('[ERROR]', result.message || 'Verification failed', 'dim');
        }

    } catch (error) {
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
