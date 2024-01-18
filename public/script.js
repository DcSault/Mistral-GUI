function sendMessage() {
    const inputField = document.getElementById('chat-input');
    const modelSelect = document.getElementById('model-select');
    const userMessage = inputField.value.trim();
    const selectedModel = modelSelect.value;
    inputField.value = '';

    if (!userMessage) return; 

    appendMessage(userMessage, 'user'); 

    const sessionId = getSessionId(); 

    
    const requestData = {
        sessionId: sessionId,
        message: userMessage,
        modelName: selectedModel
    };

    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
    })
    .then(response => response.ok ? response.json() : Promise.reject('Réponse réseau non OK'))
    .then(data => appendMessage(data.reply, 'bot')) 
    .catch(error => {
        console.error('Erreur:', error);
        appendMessage('Erreur de communication.', 'bot');
    });
}

function appendMessage(message, sender) {
    const chatBody = document.getElementById('chatbox-body');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = message;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight; 
}

function getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}