class ChatWidget {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.voiceButton = document.getElementById('voiceButton');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.voiceText = document.getElementById('voiceText');
        this.globalStopButton = document.getElementById('globalStopButton');
        
        this.isTyping = false;
        this.apiUrl = '/ask'; // Use relative URL to avoid CORS issues
        
        // Voice recognition properties
        this.recognition = null;
        this.isListening = false;
        this.currentUtterance = null;
        
        this.init();
    }
    
    init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => {
            this.sendButton.disabled = !this.messageInput.value.trim();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.stopAllVoice();
            }
        });
        
        // Initialize voice recognition
        this.initSpeechRecognition();
        
        // Voice button event listener
        this.voiceButton.addEventListener('click', () => this.toggleVoice());
        
        // Global stop button event listener
        this.globalStopButton.addEventListener('click', () => this.stopAllVoice());
        
        // Initial state
        this.sendButton.disabled = true;
    }
    
    // Voice Recognition Methods
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US'; // Can be changed to 'hi-IN' for Hindi
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceButton.classList.add('recording');
                this.voiceStatus.style.display = 'flex';
                this.voiceText.textContent = 'Listening...';
                this.updateGlobalStopButton();
            };
            
            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                if (finalTranscript) {
                    this.messageInput.value = finalTranscript;
                    this.voiceText.textContent = `Heard: "${finalTranscript}"`;
                    this.sendButton.disabled = false;
                } else if (interimTranscript) {
                    this.voiceText.textContent = `Hearing: "${interimTranscript}"`;
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.voiceText.textContent = `Error: ${event.error}`;
                this.stopListening();
                this.updateGlobalStopButton();
            };
            
            this.recognition.onend = () => {
                this.stopListening();
                this.updateGlobalStopButton();
            };
            
        } else {
            console.error('Speech recognition not supported');
            this.voiceButton.style.display = 'none';
        }
    }
    
    toggleVoice() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.voiceButton.classList.remove('recording');
            this.voiceStatus.style.display = 'none';
            this.updateGlobalStopButton();
        }
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Stop listening if active
        if (this.isListening) {
            this.stopListening();
        }
        
        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.sendButton.disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const response = await this.callAPI(message);
            this.hideTypingIndicator();
            this.addBotMessage(response);
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Chat API Error:', error);
            this.addErrorMessage(error.message || 'An error occurred while processing your request.');
        }
    }
    
    async callAPI(question) {
        try {
            console.log('Sending request to:', this.apiUrl);
            console.log('Request payload:', { question, k: 5 });
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question,
                    k: 5
                })
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.details || errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            return data;
            
        } catch (error) {
            console.error('Fetch error:', error);
            if (error.name === 'TypeError' && error.message.includes('searchParams')) {
                throw new Error('Network error: Unable to connect to the server. Please check if the server is running.');
            }
            throw error;
        }
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        
        contentDiv.appendChild(paragraph);
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();
    }
    
    addBotMessage(response) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Add answer
        const answerParagraph = document.createElement('p');
        answerParagraph.textContent = response.answer || 'No answer received';
        contentDiv.appendChild(answerParagraph);
        
        // Add voice control buttons
        const voiceControlsDiv = document.createElement('div');
        voiceControlsDiv.className = 'voice-controls';
        
        // Add speak button for AI response
        const speakButton = document.createElement('button');
        speakButton.className = 'speak-button';
        speakButton.innerHTML = '🔊';
        speakButton.title = 'Listen to this response';
        speakButton.onclick = () => this.speakText(response.answer || 'No answer received');
        voiceControlsDiv.appendChild(speakButton);
        
        // Add stop button
        const stopButton = document.createElement('button');
        stopButton.className = 'stop-button';
        stopButton.innerHTML = '⏹️';
        stopButton.title = 'Stop listening';
        stopButton.onclick = () => this.stopSpeaking();
        voiceControlsDiv.appendChild(stopButton);
        
        contentDiv.appendChild(voiceControlsDiv);
        
        // Add sources if available
        if (response.sources && response.sources.length > 0) {
            const sourcesDiv = document.createElement('div');
            sourcesDiv.className = 'sources';
            
            const sourcesTitle = document.createElement('div');
            sourcesTitle.textContent = '📚 Sources:';
            sourcesTitle.style.fontWeight = 'bold';
            sourcesTitle.style.marginBottom = '5px';
            sourcesDiv.appendChild(sourcesTitle);
            
            response.sources.forEach((source, index) => {
                const sourceItem = document.createElement('div');
                sourceItem.className = 'source-item';
                sourceItem.textContent = `Source ${source.source}: ${source.source_id} (confidence: ${(1 - source.distance).toFixed(2)})`;
                sourcesDiv.appendChild(sourceItem);
            });
            
            contentDiv.appendChild(sourcesDiv);
        }
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();
    }
    
    // Text-to-Speech functionality
    speakText(text) {
        if ('speechSynthesis' in window) {
            // Stop any ongoing speech first
            this.stopSpeaking();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US'; // Can be changed to 'hi-IN' for Hindi
            utterance.rate = 0.9; // Slightly slower for better understanding
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Try to use a female voice if available
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Samantha'));
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            
            // Store current utterance for stopping
            this.currentUtterance = utterance;
            
            // Add event listeners
            utterance.onend = () => {
                this.currentUtterance = null;
                this.updateVoiceButtons(false);
                this.updateGlobalStopButton();
            };
            
            utterance.onerror = () => {
                this.currentUtterance = null;
                this.updateVoiceButtons(false);
                this.updateGlobalStopButton();
            };
            
            window.speechSynthesis.speak(utterance);
            this.updateVoiceButtons(true);
            this.updateGlobalStopButton();
        } else {
            console.error('Text-to-speech not supported');
        }
    }
    
    // Stop speaking functionality
    stopSpeaking() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            this.currentUtterance = null;
            this.updateVoiceButtons(false);
            this.updateGlobalStopButton();
        }
    }
    
    // Update voice control buttons state
    updateVoiceButtons(isSpeaking) {
        const speakButtons = document.querySelectorAll('.speak-button');
        const stopButtons = document.querySelectorAll('.stop-button');
        
        speakButtons.forEach(btn => {
            btn.disabled = isSpeaking;
            btn.style.opacity = isSpeaking ? '0.5' : '1';
        });
        
        stopButtons.forEach(btn => {
            btn.style.display = isSpeaking ? 'inline-flex' : 'none';
        });
    }
    
    addErrorMessage(errorMessage) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.style.background = '#ffebee';
        contentDiv.style.color = '#c62828';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = `❌ Error: ${errorMessage}`;
        
        contentDiv.appendChild(paragraph);
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    // Stop all voice activities
    stopAllVoice() {
        // Stop speech synthesis
        this.stopSpeaking();
        
        // Stop voice recognition if active
        if (this.isListening) {
            this.stopListening();
        }
        
        // Hide global stop button
        this.globalStopButton.style.display = 'none';
    }
    
    // Update global stop button visibility
    updateGlobalStopButton() {
        const isAnyVoiceActive = this.isListening || this.currentUtterance;
        this.globalStopButton.style.display = isAnyVoiceActive ? 'flex' : 'none';
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
});
