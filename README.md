# My Voice - Assistive Communication Tool

A liberating spelling tool for non-speakers that provides rich, expressive voices through ElevenLabs for personal expression, a fully customizable communication board, and different visual themes to truly put the user first.

## Features

- **Rich Communication Boards**: Pre-built phrases for daily life, personal expressions, and custom additions
- **QWERTY Keyboard**: Full keyboard support with both click and physical keyboard input
- **Word Prediction**: Smart word suggestions to speed up communication
- **Premium Voices**: ElevenLabs integration for high-quality text-to-speech
- **Customizable Themes**: Multiple visual themes (Play, Gamer, Zen) for personalization
- **Responsive Design**: Works on any browser-enabled device
- **Accessibility First**: Designed for users with varying motor skills

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Text-to-Speech**: ElevenLabs API + Web Speech API fallback
- **Speech Recognition**: Web Speech API
- **Styling**: Custom CSS with CSS Grid and Flexbox

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assistive-communication-app
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   SECRET_KEY=your-secret-key-here
   ELEVENLABS_API_KEY=your-elevenlabs-api-key
   FLASK_ENV=development
   ```

5. **Run the application**
   ```bash
   python run.py
   ```

   Or using Flask directly:
   ```bash
   flask run
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Configuration

### ElevenLabs Setup

1. Sign up for an [ElevenLabs account](https://elevenlabs.io/)
2. Get your API key from the dashboard
3. Add it to your `.env` file as `ELEVENLABS_API_KEY`

### Customization

- **Themes**: Modify theme variables in `static/css/styles.css`
- **Communication Boards**: Edit the `DEFAULT_BOARDS` dictionary in `app.py`
- **Word Suggestions**: Modify the `DEFAULT_WORDS` list in `app.py`

## File Structure

```
assistive-communication-app/
├── app.py                 # Main Flask application
├── run.py                 # Application runner
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   ├── base.html         # Base template
│   ├── index.html        # Main application page
│   ├── 404.html          # Error page
│   └── 500.html          # Error page
└── static/
    ├── css/
    │   └── styles.css    # Main stylesheet
    ├── js/
    │   ├── app.js        # Main application logic
    │   ├── elevenlabs.js # ElevenLabs integration
    │   └── speech.js     # Speech recognition/synthesis
    └── uploads/          # User uploaded files
```

## API Endpoints

- `GET /` - Main application page
- `GET /api/boards` - Get communication boards data
- `GET /api/words` - Get word suggestions
- `POST /api/speak` - Text-to-speech synthesis
- `GET/POST /api/settings` - User settings management
- `POST /api/custom-phrase` - Add custom phrases

## Usage

1. **Basic Communication**: Click on pre-built phrases or type using the keyboard
2. **Custom Phrases**: Add your own phrases using the "Add Custom" button
3. **Voice Settings**: Customize your name, theme, and voice preferences
4. **Word Prediction**: Use the word suggestions panel for faster typing
5. **Speech Output**: Click "Speak" to hear your message

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactions
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Screen Reader**: Semantic HTML for screen reader compatibility
- **Touch Friendly**: Large touch targets for mobile devices

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Contributing

This tool was built to be co-created with the AAC (Augmentative and Alternative Communication) community. If you or someone you love is a speller or non-speaker and wishes to collaborate on building better versions, please get in touch!

## Future Enhancements

- User accounts for saving customizations
- More voice options and custom voice training
- Additional themes and customization options
- LLM integration for enhanced personalization
- Hardware integration (switches, eye tracking)
- Group chat and messaging features
- Mobile app versions

## License

This project is open source and available under the MIT License.

## Support

For support, feature requests, or collaboration opportunities, please open an issue or contact the development team.

---

Built with ❤️ for the AAC community