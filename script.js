function simulateLogin() {
    const status = document.getElementById('login-status');
    const gate = document.getElementById('login-gate');
    const app = document.getElementById('main-app');

    status.style.opacity = '1';
    
    setTimeout(() => {
        gate.style.opacity = '0';
        setTimeout(() => {
            gate.style.display = 'none';
            app.style.display = 'block';
        }, 500); 
    }, 2000);
}


function triggerFileUpload() {
    const uploadStep = document.getElementById('upload-step');
    const loadingBar = document.getElementById('loading-bar');
    const resultDashboard = document.getElementById('result-dashboard');


    loadingBar.style.width = '100%';
    
    setTimeout(() => {

        uploadStep.style.display = 'none';
        resultDashboard.style.display = 'block';
        resultDashboard.style.animation = 'fadeIn 0.5s ease';
    }, 1500);
}

function toggleFaq(element) {
    element.classList.toggle('active');
}

function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow.style.display === 'flex') {
        chatWindow.style.display = 'none';
    } else {
        chatWindow.style.display = 'flex';
    }
}