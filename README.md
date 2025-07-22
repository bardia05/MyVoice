# 🗣️ MyVoice - Assistive Communication Tool

**MyVoice** is an intelligent, customizable communication web app designed to empower non-speakers and spellers by giving them a voice — literally. With expressive speech synthesis, beautiful themes, and intuitive interaction, **MyVoice** transforms how people communicate, express needs, and connect with the world.

Created with ❤️ by **Harshit Bardia** to uplift lives.

---

## ✨ Preview

<img src="assets/myvoice_main_ui.png" alt="Main Interface" width="100%" />
<img src="assets/myvoice_daily_life_board.png" alt="Daily Life Phrases" width="100%" />
<img src="assets/myvoice_theme_customization.png" alt="Theme Customization" width="100%" />
<img src="assets/myvoice_about_section.png" alt="About Section" width="100%" />

---

## 🚀 Features

- 🎨 **Rich Communication Boards** – Speak through pre-built phrases, categorized for ease.
- 🔤 **Smart Word Prediction** – Enhances speed using predictive word panels.
- 🗣️ **Expressive Voices** – Powered by ElevenLabs API for lifelike speech.
- 🧩 **Fully Customizable** – Choose themes like *Play*, *Gamer*, or *Zen* for your vibe.
- 📱 **Responsive UI** – Works seamlessly across devices and screen sizes.
- ♿ **Accessibility-First Design** – Optimized for users with different motor or visual abilities.

---

## 🛠️ Technology Stack

- **Backend**: Python + Flask  
- **Frontend**: HTML5, CSS3, JavaScript  
- **Text-to-Speech**: ElevenLabs API + Web Speech API fallback  
- **Speech Recognition**: Web Speech API  
- **Styling**: Custom CSS with Grid + Flexbox  

---

## 📦 Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/myvoice.git
cd myvoice



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
myvoice/
├── app.py                 # Core Flask app
├── run.py                 # App runner
├── config.py              # Settings
├── requirements.txt       # Dependencies
├── .env                   # Environment vars
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── 404.html
│   └── 500.html
├── static/
│   ├── css/styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── elevenlabs.js
│   │   └── speech.js
│   └── uploads/
└── assets/
    ├── myvoice_main_ui.png
    ├── myvoice_daily_life_board.png
    ├── myvoice_theme_customization.png
    └── myvoice_about_section.png

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

This app thrives with real user input. If you're from the AAC community or know someone who is, your suggestions and collaboration are more than welcome.


## 🔮 Coming Soon
      🔐 User profiles to save preferences

      🧠 AI-driven message completion

      👁️ Eye-tracking and switch integration

      📲 Android/iOS App

      📞 Group chat & video calls

      🧑‍🎤 Custom voice training

---
Built with 💙 for those who speak differently.