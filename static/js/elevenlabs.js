/**
 * ElevenLabs Text-to-Speech Integration
 * Handles premium voice synthesis using ElevenLabs API
 */

class ElevenLabsVoice {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.elevenlabs.io/v1';
        this.voices = {};
        this.currentVoice = 'river';
    }

    async loadVoices() {
        try {
            const response = await fetch(`${this.baseUrl}/voices`, {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.voices = data.voices.reduce((acc, voice) => {
                    acc[voice.voice_id] = voice;
                    return acc;
                }, {});
                return this.voices;
            }
        } catch (error) {
            console.error('Error loading ElevenLabs voices:', error);
        }
        return {};
    }

    async speak(text, voiceId = null) {
        if (!this.apiKey) {
            console.warn('ElevenLabs API key not configured, falling back to system TTS');
            return this.fallbackSpeak(text);
        }

        const voice = voiceId || this.currentVoice;
        
        try {
            const response = await fetch(`${this.baseUrl}/text-to-speech/${voice}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                })
            });

            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                
                return new Promise((resolve, reject) => {
                    audio.onended = () => {
                        URL.revokeObjectURL(audioUrl);
                        resolve();
                    };
                    audio.onerror = reject;
                    audio.play();
                });
            } else {
                throw new Error(`ElevenLabs API error: ${response.status}`);
            }
        } catch (error) {
            console.error('ElevenLabs TTS error:', error);
            return this.fallbackSpeak(text);
        }
    }

    fallbackSpeak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Try to use a higher quality voice if available
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.name.includes('Google') || 
                voice.name.includes('Microsoft') ||
                voice.quality === 'high'
            );
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            speechSynthesis.speak(utterance);
            
            return new Promise((resolve) => {
                utterance.onend = resolve;
                utterance.onerror = resolve;
            });
        }
        
        return Promise.resolve();
    }

    setVoice(voiceId) {
        this.currentVoice = voiceId;
    }

    getAvailableVoices() {
        return Object.values(this.voices);
    }
}

// Export for use in main app
window.ElevenLabsVoice = ElevenLabsVoice;