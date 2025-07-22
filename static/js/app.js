// Global state
let currentMessage = '';
let currentTheme = 'play';
let userName = 'My';
let boards = {};
let words = [];
let minePhrasesData = [];
let phraseUsage = {};

// DOM elements
const messageDisplay = document.getElementById('message-display');
const messageText = document.getElementById('message-text');
const mineBtn = document.getElementById('mine-btn');
const clearBtn = document.getElementById('clear-btn');
const speakBtn = document.getElementById('speak-btn');
const voiceSettingsBtn = document.getElementById('voice-settings-btn');
const aboutBtn = document.getElementById('about-btn');
const mineBoard = document.getElementById('mine-board');
const dailyLifeBoard = document.getElementById('daily-life-board');
// const keyboard = document.getElementById('keyboard');
const wordSuggestions = document.getElementById('word-suggestions');
const wordSearch = document.getElementById('word-search');
const addCustomBtn = document.getElementById('add-custom-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const statusText = document.getElementById('status-text');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadBoards();
    loadMinePhrasesData();
    loadWords();
    loadSettings();
    setupEventListeners();
    updateMessage();
});

// Event listeners
function setupEventListeners() {
    // Header controls
    mineBtn.addEventListener('click', showMineSection);
    clearBtn.addEventListener('click', clearMessage);
    speakBtn.addEventListener('click', speakMessage);
    voiceSettingsBtn.addEventListener('click', showSettings);
    aboutBtn.addEventListener('click', showAbout);
    addCustomBtn.addEventListener('click', showAddCustom);
    
    // Save message button
    const saveMessageBtn = document.getElementById('save-message-btn');
    saveMessageBtn.addEventListener('click', saveCurrentMessageToMine);

    // Keyboard
    // keyboard.addEventListener('click', handleKeyboardClick);
    
    // Word search
    wordSearch.addEventListener('input', handleWordSearch);
    
    // Mode tabs
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    // Modal
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            hideModal();
        }
    });

    // Add context menu for Mine phrases (right-click to save/remove)
    document.addEventListener('contextmenu', handleContextMenu);

    // Physical keyboard support
    document.addEventListener('keydown', handlePhysicalKeyboard);
}

// Load data from API
async function loadBoards() {
    try {
        const response = await fetch('/api/boards');
        boards = await response.json();
        renderDailyLifeBoard();
    } catch (error) {
        console.error('Error loading boards:', error);
    }
}

async function loadMinePhrasesData() {
    try {
        const response = await fetch('/api/mine-phrases');
        minePhrasesData = await response.json();
        renderMineBoard();
        
        // Load phrase usage statistics
        const usageResponse = await fetch('/api/phrase-usage');
        phraseUsage = await usageResponse.json();
    } catch (error) {
        console.error('Error loading mine phrases:', error);
    }
}

async function loadWords() {
    try {
        const response = await fetch('/api/words');
        words = await response.json();
        renderWordSuggestions(words);
    } catch (error) {
        console.error('Error loading words:', error);
    }
}

async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        userName = settings.user_name;
        currentTheme = settings.theme;
        applyTheme(currentTheme);
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Render functions
function renderMineBoard() {
    // Render mine board
    if (minePhrasesData) {
        mineBoard.innerHTML = minePhrasesData.map(item => `
            <div class="board-item mine-item" data-text="${item.text}" data-removable="${item.auto_saved || item.saved_at ? 'true' : 'false'}">
                <span class="board-item-icon">⭐</span>
                <span class="board-item-text">${item.text}</span>
                ${item.auto_saved ? '<span class="auto-saved-badge">Auto</span>' : ''}
                ${item.usage_count ? `<span class="usage-count">${item.usage_count}x</span>` : ''}
            </div>
        `).join('');
    }
    
    // Add click listeners to mine board items
    document.querySelectorAll('.mine-item').forEach(item => {
        item.addEventListener('click', () => {
            const text = item.dataset.text;
            addToMessage(text);
        });
    });
}

function renderDailyLifeBoard() {
    // Render daily life board
    if (boards.daily_life) {
        dailyLifeBoard.innerHTML = boards.daily_life.map(item => `
            <div class="board-item" data-text="${item.text}" style="background-color: ${item.color}20; border-color: ${item.color}40;">
                <span class="board-item-icon">${item.icon}</span>
                <span class="board-item-text">${item.text}</span>
            </div>
        `).join('');
    }

    // Add click listeners to daily life board items
    document.querySelectorAll('#daily-life-board .board-item').forEach(item => {
        item.addEventListener('click', () => {
            const text = item.dataset.text;
            addToMessage(text);
        });
    });
}

function renderWordSuggestions(wordList) {
    wordSuggestions.innerHTML = wordList.map(word => `
        <div class="word-suggestion" data-word="${word}">${word}</div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.word-suggestion').forEach(item => {
        item.addEventListener('click', () => {
            const word = item.dataset.word;
            addToMessage(word);
        });
    });
}

// Message handling
function addToMessage(text) {
    if (currentMessage && !currentMessage.endsWith(' ') && !text.startsWith(' ')) {
        currentMessage += ' ';
    }
    currentMessage += text;
    updateMessage();
    updateStatus(`Added: "${text}"`);
    
    // Track usage for potential auto-saving
    trackPhraseUsage(text);
}

function updateMessage() {
    if (currentMessage.trim()) {
        messageText.textContent = currentMessage;
    } else {
        messageText.textContent = 'What would you like to say?';
    }
}

function clearMessage() {
    currentMessage = '';
    updateMessage();
    updateStatus('Message cleared');
}

async function speakMessage() {
    if (!currentMessage.trim()) {
        updateStatus('No message to speak');
        return;
    }

    try {
        updateStatus('Speaking...');
        
        // Use Web Speech API as fallback
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentMessage);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }

        // Also send to backend for ElevenLabs integration
        const response = await fetch('/api/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: currentMessage,
                voice: 'system'
            })
        });

        if (response.ok) {
            updateStatus('Message spoken');
            
            // Reload mine phrases in case auto-saving occurred
            setTimeout(loadMinePhrasesData, 1000);
        }
    } catch (error) {
        console.error('Error speaking message:', error);
        updateStatus('Error speaking message');
    }
}

// Keyboard handling
function handleKeyboardClick(e) {
    if (!e.target.classList.contains('key')) return;

    const key = e.target.dataset.key;
    handleKeyInput(key);
}

function handlePhysicalKeyboard(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    e.preventDefault();
    
    if (e.key === 'Backspace') {
        handleKeyInput('backspace');
    } else if (e.key === 'Enter') {
        handleKeyInput('enter');
    } else if (e.key === ' ') {
        handleKeyInput(' ');
    } else if (e.key.length === 1) {
        handleKeyInput(e.key.toLowerCase());
    }
}

function handleKeyInput(key) {
    const keyElement = document.querySelector(`[data-key="${key}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => keyElement.classList.remove('active'), 150);
    }

    switch (key) {
        case 'backspace':
            currentMessage = currentMessage.slice(0, -1);
            break;
        case 'enter':
            speakMessage();
            return;
        case 'shift':
            // Toggle shift state if needed
            return;
        case ' ':
            currentMessage += ' ';
            break;
        default:
            currentMessage += key;
    }

    updateMessage();
    updateWordSuggestions();
}

// Word search and suggestions
function handleWordSearch(e) {
    const query = e.target.value.toLowerCase();
    if (query) {
        const filteredWords = words.filter(word => 
            word.toLowerCase().startsWith(query)
        ).slice(0, 20);
        renderWordSuggestions(filteredWords);
    } else {
        renderWordSuggestions(words.slice(0, 50));
    }
}

function updateWordSuggestions() {
    const lastWord = currentMessage.split(' ').pop().toLowerCase();
    if (lastWord) {
        const suggestions = words.filter(word => 
            word.toLowerCase().startsWith(lastWord)
        ).slice(0, 20);
        renderWordSuggestions(suggestions);
    }
}

// Mode switching
function switchMode(mode) {
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Load different word sets based on mode
    switch (mode) {
        case 'mine':
            renderWordSuggestions(words.slice(0, 50));
            break;
        case 'daily':
            renderWordSuggestions(words.filter(word => 
                ['eat', 'drink', 'sleep', 'help', 'please', 'thank', 'yes', 'no'].includes(word)
            ));
            break;
        case 'feel':
            renderWordSuggestions(words.filter(word => 
                ['happy', 'sad', 'angry', 'tired', 'excited', 'scared', 'love', 'like'].includes(word)
            ));
            break;
        case 'keys':
            renderWordSuggestions(words.slice(0, 50));
            break;
    }
}

// Modal functions
function showModal(content) {
    modalContent.innerHTML = content;
    modalOverlay.classList.remove('hidden');
}

function hideModal() {
    modalOverlay.classList.add('hidden');
}

function handleContextMenu(e) {
    // Handle right-click context menu for Mine phrases
    const mineItem = e.target.closest('.mine-item');
    if (mineItem) {
        e.preventDefault();
        showMineContextMenu(e, mineItem);
    }
    
    // Handle right-click to save current message to Mine
    const messageDisplay = e.target.closest('#message-display');
    if (messageDisplay && currentMessage.trim()) {
        e.preventDefault();
        showSaveToMineMenu(e);
    }
}

function showMineContextMenu(e, mineItem) {
    const text = mineItem.dataset.text;
    const isRemovable = mineItem.dataset.removable === 'true';
    
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.position = 'fixed';
    contextMenu.style.left = e.clientX + 'px';
    contextMenu.style.top = e.clientY + 'px';
    contextMenu.style.zIndex = '1001';
    
    contextMenu.innerHTML = `
        <div class="context-menu-item" onclick="addToMessage('${text}')">
            <span class="context-icon">💬</span>
            Add to Message
        </div>
        ${isRemovable ? `
        <div class="context-menu-item" onclick="removeFromMine('${text}')">
            <span class="context-icon">🗑️</span>
            Remove from Mine
        </div>
        ` : ''}
    `;
    
    document.body.appendChild(contextMenu);
    
    // Remove context menu when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', function removeMenu() {
            contextMenu.remove();
            document.removeEventListener('click', removeMenu);
        });
    }, 10);
}

function showSaveToMineMenu(e) {
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.position = 'fixed';
    contextMenu.style.left = e.clientX + 'px';
    contextMenu.style.top = e.clientY + 'px';
    contextMenu.style.zIndex = '1001';
    
    contextMenu.innerHTML = `
        <div class="context-menu-item" onclick="saveCurrentMessageToMine()">
            <span class="context-icon">⭐</span>
            Save to Mine
        </div>
    `;
    
    document.body.appendChild(contextMenu);
    
    // Remove context menu when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', function removeMenu() {
            contextMenu.remove();
            document.removeEventListener('click', removeMenu);
        });
    }, 10);
}

function showMineSection() {
    document.getElementById('mine-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function showSettings() {
    const content = `
        <div class="modal-header">
            <h3 class="modal-title">🔧 My Choices</h3>
            <button class="modal-close" onclick="hideModal()">×</button>
        </div>
        
        <form id="settings-form">
            <div class="form-group">
                <label class="form-label">Your Name (Optional)</label>
                <input type="text" class="form-input" id="user-name-input" 
                       placeholder="Enter your first name..." value="${userName}">
                <small style="color: var(--text-secondary); font-size: 0.75rem;">
                    Personalizes your app name (e.g., "Sarah's Voice")
                </small>
            </div>
            
            <div class="form-group">
                <label class="form-label">Theme</label>
                <div class="theme-selector">
                    <div class="theme-option ${currentTheme === 'gamer' ? 'selected' : ''}" data-theme="gamer">
                        <div class="theme-name">Gamer</div>
                        <div class="theme-description">Dark theme with neon accents</div>
                    </div>
                    <div class="theme-option ${currentTheme === 'play' ? 'selected' : ''}" data-theme="play">
                        <div class="theme-name">Play</div>
                        <div class="theme-description">Purple gradient with teal accents</div>
                    </div>
                    <div class="theme-option ${currentTheme === 'zen' ? 'selected' : ''}" data-theme="zen">
                        <div class="theme-name">Zen</div>
                        <div class="theme-description">Soft and calming pastels</div>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Voice</label>
                <select class="form-input" id="voice-select">
                    <option value="river">River (Premium)</option>
                    <option value="system">Choose a system voice...</option>
                </select>
                <div style="margin-top: 0.5rem; padding: 0.75rem; background: var(--surface); border-radius: 8px;">
                    <small style="color: var(--text-secondary);">Current: River</small>
                </div>
            </div>
            
            <button type="submit" class="btn btn-speak" style="width: 100%; margin-top: 1rem;">
                Save Settings
            </button>
        </form>
    `;
    
    showModal(content);
    
    // Add event listeners for settings form
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => selectTheme(option.dataset.theme));
    });
}

function showAbout() {
    const content = `
                <div class="modal-header">
                <h3 class="modal-title">💡 About MyVoice</h3>
                <button class="modal-close" onclick="hideModal()">×</button>
            </div>

                <div style="line-height: 1.6; color: var(--text-primary);">
                    <p style="margin-bottom: 1rem;">
                        <strong>MyVoice</strong> is a communication web app built to empower individuals who are unable to speak,
                        helping them express themselves with confidence and clarity. Created with compassion and purpose by 
                        <strong>Harshit Bardia</strong>, this project aims to give a voice to those who need it the most.
                    </p>
                    
                    <p style="margin-bottom: 1rem;">
                        Our vision is to bridge the communication gap using technology, making interaction more inclusive and accessible. 
                        With features that convert text to speech and a clean, intuitive interface, MyVoice enables users to communicate in 
                        real-time. Future updates will include personalized voice options, offline capabilities, and integration with assistive 
                        devices like eye trackers and switches.
                    </p>
                    
                    <div style="background: var(--surface); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                        <p style="margin-bottom: 0.5rem;">
                            📧 We welcome feedback and collaboration. If you or someone you know could benefit from MyVoice,
                            or have ideas to improve it further, don’t hesitate to get in touch!
                        </p>
                    </div>
                    
                    <p style="text-align: center; margin-top: 1.5rem; color: var(--text-secondary);">
                        Built with ❤️ by Harshit Bardia to give a voice to the voiceless
                    </p>
            </div>

        
        <button class="btn btn-speak" onclick="hideModal()" style="width: 100%; margin-top: 1rem;">
            Close
        </button>
    `;
    
    showModal(content);
}

function showAddCustom() {
    const content = `
        <div class="modal-header">
            <h3 class="modal-title">➕ Add Custom Phrase</h3>
            <button class="modal-close" onclick="hideModal()">×</button>
        </div>
        
        <form id="custom-phrase-form">
            <div class="form-group">
                <label class="form-label">Custom Phrase</label>
                <input type="text" class="form-input" id="custom-phrase-input" 
                       placeholder="Enter your custom phrase..." required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-input" id="custom-category-select">
                    <option value="mine">Mine</option>
                    <option value="daily_life">Daily Life</option>
                </select>
            </div>
            
            <button type="submit" class="btn btn-speak" style="width: 100%;">
                Add Phrase
            </button>
        </form>
    `;
    
    showModal(content);
    
    document.getElementById('custom-phrase-form').addEventListener('submit', addCustomPhrase);
}

// Settings functions
function selectTheme(theme) {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-theme="${theme}"]`).classList.add('selected');
    currentTheme = theme;
    applyTheme(theme);
}

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    document.body.dataset.theme = theme;
}

async function saveSettings(e) {
    e.preventDefault();
    
    const newUserName = document.getElementById('user-name-input').value || 'My';
    const newVoice = document.getElementById('voice-select').value;
    
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_name: newUserName,
                theme: currentTheme,
                voice: newVoice
            })
        });

        if (response.ok) {
            userName = newUserName;
            updateStatus('Settings saved');
            hideModal();
            
            // Update UI with new name
            document.querySelector('.voice-label').textContent = `${userName}'s Voice`;
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        updateStatus('Error saving settings');
    }
}

async function addCustomPhrase(e) {
    e.preventDefault();
    
    const phrase = document.getElementById('custom-phrase-input').value;
    const category = document.getElementById('custom-category-select').value;
    
    try {
        const response = await fetch('/api/custom-phrase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phrase: phrase,
                category: category
            })
        });

        if (response.ok) {
            // Add to local boards data
            if (!boards[category]) {
                boards[category] = [];
            }
            boards[category].push({
                text: phrase,
                category: category
            });
            
            renderBoards();
            updateStatus(`Added custom phrase: "${phrase}"`);
            hideModal();
        }
    } catch (error) {
        console.error('Error adding custom phrase:', error);
        updateStatus('Error adding custom phrase');
    }
}

// Mine saving functions
async function saveCurrentMessageToMine() {
    if (!currentMessage.trim()) {
        updateStatus('No message to save');
        return;
    }
    
    try {
        const response = await fetch('/api/save-to-mine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phrase: currentMessage.trim()
            })
        });
        
        const result = await response.json();
        if (result.success) {
            updateStatus(`Saved to Mine: "${currentMessage.trim()}"`);
            loadMinePhrasesData(); // Reload mine phrases
        } else {
            updateStatus(result.message);
        }
    } catch (error) {
        console.error('Error saving to mine:', error);
        updateStatus('Error saving to Mine');
    }
}

async function removeFromMine(phrase) {
    try {
        const response = await fetch('/api/remove-from-mine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phrase: phrase
            })
        });
        
        const result = await response.json();
        if (result.success) {
            updateStatus(`Removed from Mine: "${phrase}"`);
            loadMinePhrasesData(); // Reload mine phrases
        }
    } catch (error) {
        console.error('Error removing from mine:', error);
        updateStatus('Error removing from Mine');
    }
}

function trackPhraseUsage(phrase) {
    // Track phrase usage locally
    if (!phraseUsage[phrase]) {
        phraseUsage[phrase] = 0;
    }
    phraseUsage[phrase]++;
    
    // Show notification for frequently used phrases
    if (phraseUsage[phrase] === 3) {
        updateStatus(`"${phrase}" will be auto-saved to Mine after next use`);
    }
}

// Utility functions
function updateStatus(message) {
    statusText.textContent = message;
    setTimeout(() => {
        statusText.textContent = 'Ready to communicate';
    }, 3000);
}

// Make functions globally available
window.hideModal = hideModal;
window.showSettings = showSettings;
window.showAbout = showAbout;