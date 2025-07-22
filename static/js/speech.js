/**
 * Speech Recognition and Synthesis manager
 * Handles both input (speech-to-text) and output (text-to-speech)
 */

class SpeechManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.elevenLabs = null;
        
        this.initializeSpeechRecognition();
        this.initializeElevenLabs();
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                updateStatus('Listening for room conversation...');
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                updateStatus('Stopped listening');
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
                    this.handleSpeechInput(finalTranscript);
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                updateStatus(`Speech recognition error: ${event.error}`);
            };
        }
    }

    async initializeElevenLabs() {
        // This would be initialized with API key from backend
        // For now, we'll use the fallback system voices
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
            }
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    handleSpeechInput(transcript) {
        // This could be used for room conversation monitoring
        // or voice commands in the future
        console.log('Speech input:', transcript);
        
        // Check for voice commands
        const lowerTranscript = transcript.toLowerCase();
        if (lowerTranscript.includes('clear message')) {
            clearMessage();
        } else if (lowerTranscript.includes('speak message')) {
            speakMessage();
        }
    }

    async speak(text, voice = 'system') {
        if (!text.trim()) return;

        try {
            if (this.elevenLabs && voice !== 'system') {
                await this.elevenLabs.speak(text, voice);
            } else {
                await this.speakWithSystemVoice(text);
            }
        } catch (error) {
            console.error('Error speaking:', error);
            await this.speakWithSystemVoice(text);
        }
    }

    async speakWithSystemVoice(text) {
        return new Promise((resolve) => {
            if (!this.synthesis) {
                resolve();
                return;
            }

            // Cancel any ongoing speech
            this.synthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;

            // Try to use a high-quality voice
            const voices = this.synthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.name.includes('Google') || 
                voice.name.includes('Microsoft') ||
                voice.lang.startsWith('en')
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onend = resolve;
            utterance.onerror = resolve;

            this.synthesis.speak(utterance);
        });
    }

    getAvailableVoices() {
        if (!this.synthesis) return [];
        
        return this.synthesis.getVoices().filter(voice => 
            voice.lang.startsWith('en')
        );
    }

    setElevenLabsKey(apiKey) {
        if (window.ElevenLabsVoice) {
            this.elevenLabs = new window.ElevenLabsVoice(apiKey);
        }
    }
}

// Initialize speech manager
const speechManager = new SpeechManager();

// Export for global use
window.speechManager = speechManager;

