# 🂠 Poker Card Dealer

A professional poker card dealing application built with React, TypeScript, PixiJS, and GSAP animations. Features smooth card animations, multi-deck support, and comprehensive dealer controls.

## Features

- 🎴 High-performance card rendering with PixiJS v7.4
- ✨ Smooth animations using GSAP
- 🎲 Multi-deck support (1-4 decks)
- ⏯️ Full dealer controls (start, pause, resume, shuffle, rewind)
- 🎮 Dual dealing modes (automatic & manual)
- 📊 Real-time card history tracking
- 🔊 Audio announcements for dealt cards with voice synthesis
- 🌍 Multi-language support (English & Spanish)
- 🎨 9 beautiful themes (Classic Dark, Casino Red, Green Felt, Ocean Blue, Royal Purple, Sunset Blaze, Midnight Sky, Neon Nights, Deep Forest)
- ⚙️ Adjustable dealing intervals
- 📈 Progress indicator for next card
- 📱 Responsive design & PWA support
- 💾 Settings persistence (theme, language, audio preferences)

## Demo

Visit the live demo: [https://jjchiw.github.io/poker-card-dealer/](https://jjchiw.github.io/poker-card-dealer/)

## Usage

### Dealing Modes
- **Automatic Mode**: Cards are dealt automatically at the specified interval
- **Manual Mode**: Click "Deal Next Card" to deal one card at a time

### Controls
- **Shuffle**: Reset the deck and shuffle cards
- **Start/Pause/Resume**: Control the dealing process
- **Rewind**: Go back one card in the history
- **Adjust Interval**: Change the time between automatic deals (1-10 seconds)
- **Deck Selection**: Choose 1-4 decks (52-208 cards)

### Customization
- **Themes**: Choose from 9 visual themes via the theme selector (🌙 icon)
- **Language**: Toggle between English and Spanish (🌐 icon)
- **Audio**: Enable/disable card announcements (🔊 icon)

## Run Locally

**Prerequisites:** Node.js 20+

1. Clone the repository:
   ```bash
   git clone https://github.com/jjchiw/poker-card-dealer.git
   cd poker-card-dealer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## PWA Installation

This app can be installed as a Progressive Web App (PWA) for offline use:

1. Visit the [live demo](https://jjchiw.github.io/poker-card-dealer/)
2. Look for the install prompt in your browser (usually in the address bar)
3. Click "Install" to add it to your device
4. Launch the app from your home screen or app menu

The installed app works offline and provides a native app-like experience.

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Audio Generation (Optional)

The app includes audio announcements for dealt cards. To generate custom TTS audio files:

1. Navigate to the scripts directory:
   ```bash
   cd scripts
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up Azure Speech Services or OpenAI API credentials (see `scripts/README.md` for details)

4. Run the generation script:
   ```bash
   python generate_audio_azure.py  # or generate_audio.py for OpenAI
   ```

For detailed instructions, see [scripts/README.md](scripts/README.md) and [scripts/AZURE_SETUP.md](scripts/AZURE_SETUP.md).

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & PWA support
- **PixiJS 7.4** - High-performance 2D rendering
- **GSAP** - Animation library
- **Tailwind CSS** - Styling
- **Web Audio API** - Card announcements
- **Azure Speech Services** - TTS audio generation (optional)

## Deployment

This project is configured to automatically deploy to GitHub Pages via GitHub Actions. Every push to the `main` branch triggers a deployment.

## License

MIT
