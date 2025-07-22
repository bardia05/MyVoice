from flask import Flask, render_template, request, jsonify, session
import json
import os
from datetime import datetime
from collections import defaultdict

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'

# Configuration
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory 
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# In-memory storage for phrase usage tracking (in production, use a database)
phrase_usage = defaultdict(int)
user_mine_phrases = []

# Default communication boards data
DEFAULT_BOARDS = {
    'mine': [
        {'text': 'Welcome to My Voice. A personalized assistant for spellers and non-speakers.', 'category': 'intro'},
        {'text': 'My name is Kevan, and this is My Voice!', 'category': 'intro'},
        {'text': 'After school, can we play Battleship?', 'category': 'activities'},
        {'text': 'Mom and dad, can we watch Elio this weekend?', 'category': 'family'},
        {'text': "I'm hungry!", 'category': 'needs'},
        {'text': "Peter, you're silly", 'category': 'social'}
    ],
    'daily_life': [
        {'text': 'Help me please', 'icon': '🆘', 'color': '#ff6b6b'},
        {'text': "What's for dinner?", 'icon': '🍽️', 'color': '#ffd93d'},
        {'text': 'I need a glass of water', 'icon': '💧', 'color': '#74c0fc'},
        {'text': "What's for breakfast?", 'icon': '🥞', 'color': '#ffd93d'},
        {'text': "What's for lunch?", 'icon': '🥪', 'color': '#ffd93d'},
        {'text': "I'm hungry", 'icon': '🍎', 'color': '#ff8cc8'},
        {'text': "I'm thirsty", 'icon': '🥤', 'color': '#74c0fc'},
        {'text': 'What time is it?', 'icon': '🕐', 'color': '#ffd93d'},
        {'text': 'What day is it?', 'icon': '📅', 'color': '#51cf66'},
        {'text': 'I need to brush my teeth', 'icon': '🦷', 'color': '#74c0fc'},
        {'text': "I'd like to shower", 'icon': '🚿', 'color': '#74c0fc'},
        {'text': 'I need to use the bathroom', 'icon': '🚽', 'color': '#ffd93d'},
        {'text': 'I want to brush my hair', 'icon': '🪄', 'color': '#ff8cc8'},
        {'text': 'Open the window please', 'icon': '🪟', 'color': '#51cf66'},
        {'text': 'Close the window please', 'icon': '🪟', 'color': '#ff6b6b'},
        {'text': 'Turn on the TV please', 'icon': '📺', 'color': '#74c0fc'},
        {'text': 'Turn off the TV please', 'icon': '📺', 'color': '#495057'},
        {'text': 'Turn on the light please', 'icon': '💡', 'color': '#ffd93d'},
        {'text': 'Turn off the light please', 'icon': '💡', 'color': '#495057'},
        {'text': "I'm tired", 'icon': '😴', 'color': '#74c0fc'},
        {'text': 'I need to sit down', 'icon': '🪑', 'color': '#51cf66'},
        {'text': 'Open the door please', 'icon': '🚪', 'color': '#51cf66'},
        {'text': 'Close the door please', 'icon': '🚪', 'color': '#ff6b6b'},
        {'text': 'I need to take my medicine', 'icon': '💊', 'color': '#ff8cc8'},
        {'text': "I'm hot", 'icon': '🔥', 'color': '#ff6b6b'},
        {'text': "I'm cold", 'icon': '🧊', 'color': '#74c0fc'},
        {'text': 'Happy birthday', 'icon': '🎂', 'color': '#ffd93d'},
        {'text': 'I have something to say', 'icon': '💬', 'color': '#74c0fc'},
        {'text': "What's your name?", 'icon': '❓', 'color': '#ff8cc8'},
        {'text': "What's new?", 'icon': '🆕', 'color': '#51cf66'},
        {'text': 'I missed you', 'icon': '💙', 'color': '#74c0fc'},
        {'text': 'How was school?', 'icon': '🏫', 'color': '#ffd93d'},
        {'text': 'Yes', 'icon': '✅', 'color': '#51cf66'},
        {'text': 'Hello', 'icon': '👋', 'color': '#ffd93d'},
        {'text': 'Goodbye', 'icon': '👋', 'color': '#ff8cc8'},
        {'text': 'What have you been doing?', 'icon': '😊', 'color': '#ffd93d'},
        {'text': 'Good night', 'icon': '🌙', 'color': '#74c0fc'},
        {'text': 'Thank you', 'icon': '🙏', 'color': '#ffd93d'},
        {'text': "I'm good", 'icon': '👍', 'color': '#51cf66'},
        {'text': 'Good morning', 'icon': '☀️', 'color': '#ffd93d'}
    ]
}

# Default word suggestions
DEFAULT_WORDS = [
    'I', 'a', 'about', 'after', 'afternoon', 'all', 'am', 'an', 'and', 'another',
    'are', 'around', 'at', 'bad', 'be', 'because', 'before', 'behind', 'between',
    'big', 'but', 'buy', 'can', 'come', 'could', 'day', 'do', 'does', 'don\'t',
    'down', 'each', 'even', 'every', 'feel', 'find', 'first', 'for', 'from',
    'get', 'give', 'go', 'good', 'great', 'had', 'has', 'have', 'he', 'help',
    'her', 'here', 'him', 'his', 'how', 'if', 'in', 'into', 'is', 'it', 'its',
    'just', 'know', 'last', 'leave', 'let', 'like', 'little', 'look', 'make',
    'man', 'may', 'me', 'most', 'my', 'need', 'new', 'no', 'not', 'now', 'of',
    'off', 'old', 'on', 'one', 'only', 'or', 'other', 'our', 'out', 'over',
    'own', 'people', 'place', 'please', 'right', 'said', 'same', 'say', 'see',
    'she', 'should', 'so', 'some', 'take', 'than', 'that', 'the', 'their',
    'them', 'there', 'these', 'they', 'think', 'this', 'those', 'through',
    'time', 'to', 'too', 'two', 'up', 'use', 'very', 'want', 'water', 'way',
    'we', 'well', 'were', 'what', 'when', 'where', 'which', 'who', 'will',
    'with', 'work', 'would', 'year', 'you', 'your'
]

# Themes configuration
THEMES = {
    'play': {
        'name': 'Play',
        'description': 'Purple gradient with teal accents',
        'primary_color': '#8b5cf6',
        'secondary_color': '#06b6d4',
        'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    'gamer': {
        'name': 'Gamer',
        'description': 'Dark theme with neon accents',
        'primary_color': '#10b981',
        'secondary_color': '#06b6d4',
        'background': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    },
    'zen': {
        'name': 'Zen',
        'description': 'Soft and calming pastels',
        'primary_color': '#f3e8ff',
        'secondary_color': '#e0e7ff',
        'background': 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%)'
    }
}

@app.route('/')
def index():
    """Main application page"""
    user_name = session.get('user_name', 'My')
    current_theme = session.get('theme', 'play')
    return render_template('index.html', 
                         user_name=user_name, 
                         theme=current_theme,
                         themes=THEMES)

@app.route('/api/boards')
def get_boards():
    """Get communication boards data"""
    return jsonify(DEFAULT_BOARDS)

@app.route('/api/words')
def get_words():
    """Get word suggestions"""
    query = request.args.get('q', '').lower()
    if query:
        filtered_words = [word for word in DEFAULT_WORDS if word.lower().startswith(query)]
        return jsonify(filtered_words[:20])  # Limit to 20 suggestions
    return jsonify(DEFAULT_WORDS[:50])  # Return first 50 words by default

@app.route('/api/speak', methods=['POST'])
def speak():
    """Handle text-to-speech requests"""
    data = request.get_json()
    text = data.get('text', '')
    voice = data.get('voice', 'system')
    
    # Here you would integrate with ElevenLabs API
    # For now, we'll just return success
    return jsonify({
        'success': True,
        'text': text,
        'voice': voice,
        'message': 'Speech synthesis would be handled here'
    })

@app.route('/api/settings', methods=['GET', 'POST'])
def settings():
    """Handle user settings"""
    if request.method == 'POST':
        data = request.get_json()
        session['user_name'] = data.get('user_name', 'My')
        session['theme'] = data.get('theme', 'play')
        session['voice'] = data.get('voice', 'system')
        return jsonify({'success': True})
    
    return jsonify({
        'user_name': session.get('user_name', 'My'),
        'theme': session.get('theme', 'play'),
        'voice': session.get('voice', 'system')
    })

@app.route('/api/custom-phrase', methods=['POST'])
def add_custom_phrase():
    """Add custom phrase to communication board"""
    data = request.get_json()
    phrase = data.get('phrase', '')
    category = data.get('category', 'mine')
    
    # In a real app, you'd save this to a database
    # For now, we'll just return success
    return jsonify({
        'success': True,
        'phrase': phrase,
        'category': category
    })

## Save to mine--->

@app.route('/api/save-to-mine', methods=['POST'])
def save_to_mine():
    """Manually save phrase to Mine section"""
    data = request.get_json()
    phrase = data.get('phrase', '').strip()
    
    if phrase and phrase not in [p['text'] for p in user_mine_phrases]:
        user_mine_phrases.append({
            'text': phrase,
            'category': 'mine',
            'saved_at': datetime.now().isoformat(),
            'usage_count': phrase_usage.get(phrase, 0)
        })
        
        return jsonify({
            'success': True,
            'phrase': phrase,
            'message': 'Phrase saved to Mine'
        })
    
    return jsonify({
        'success': False,
        'message': 'Phrase already exists in Mine or is empty'
    })

@app.route('/api/mine-phrases')
def get_mine_phrases():
    """Get all Mine phrases (default + user saved)"""
    all_mine_phrases = DEFAULT_BOARDS['mine'] + user_mine_phrases
    return jsonify(all_mine_phrases)

@app.route('/api/remove-from-mine', methods=['POST'])
def remove_from_mine():
    """Remove phrase from Mine section"""
    data = request.get_json()
    phrase = data.get('phrase', '').strip()
    
    global user_mine_phrases
    user_mine_phrases = [p for p in user_mine_phrases if p['text'] != phrase]
    
    return jsonify({
        'success': True,
        'message': 'Phrase removed from Mine'
    })

@app.route('/api/phrase-usage')
def get_phrase_usage():
    """Get phrase usage statistics"""
    return jsonify(dict(phrase_usage))

def auto_save_to_mine(phrase):
    """Automatically save frequently used phrases to Mine"""
    if phrase not in [p['text'] for p in user_mine_phrases]:
        user_mine_phrases.append({
            'text': phrase,
            'category': 'mine',
            'saved_at': datetime.now().isoformat(),
            'usage_count': phrase_usage[phrase],
            'auto_saved': True
        })



@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)