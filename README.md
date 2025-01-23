# 🎵 Mood-Based Music Player

[![Netlify Status](https://api.netlify.com/api/v1/badges/88e62178-35f5-43d5-a6fa-23f8b360462c/deploy-status)](https://app.netlify.com/sites/mrprince-mood-based-music-player/deploys)

## 🌐 Live Demo
**[Try the app here!](https://mrprince-mood-based-music-player.netlify.app)**

A web-based music player that adapts to your mood through facial expressions and plays music that matches your emotional state.

## 🌟 Features

### 🎭 Mood Detection
- Real-time facial expression analysis using TensorFlow.js
- Continuous mood tracking with confidence scores
- Visual mood indicators and history
- Privacy-focused (all processing done in browser)

### 🎵 Music Features
- Drag-and-drop music upload
- Automatic mood-based playlist organization
- Shuffle and repeat modes
- Progress tracking with waveform display
- Support for various audio formats (MP3, WAV, OGG)

### 💫 Modern Interface
- Beautiful, responsive design
- Dark mode support
- Intuitive controls
- Real-time visualizations
- Mood history tracking

## 🚀 Live Demo

Visit [https://mrprince-mood-based-music-player.netlify.app](https://mrprince-mood-based-music-player.netlify.app)

## 🛠️ Technical Details

### Technologies Used
- TensorFlow.js for facial recognition
- Web Audio API for music processing
- Modern JavaScript (ES6+)
- HTML5 & CSS3 with Tailwind CSS
- Netlify for hosting

### Project Structure
```
mood-based-music-player/
├── index.html          # Main HTML file
├── app.js             # Application logic
├── assets/           # Images and resources
├── models/           # TensorFlow.js models
└── netlify.toml      # Deployment config
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 76+, Edge 80+, Safari 13+)
- Webcam access
- Music files (MP3, WAV, OGG)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/MrPrince419/mood-based-music-player.git
   cd mood-based-music-player
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## 🔧 Troubleshooting Guide

### Camera Issues
1. **No camera access**
   - Check browser permissions
   - Allow camera access when prompted
   - Verify no other apps are using the camera

2. **Camera not detected**
   - Refresh the page
   - Check camera connection
   - Try a different browser

### Music Playback Issues
1. **No sound**
   - Check volume settings
   - Verify file format support
   - Clear browser cache

2. **Upload errors**
   - Check file size (max 50MB)
   - Verify file format
   - Try uploading smaller files

### Browser Support
- Chrome 80+
- Firefox 76+
- Safari 13+
- Edge 80+

## 🔒 Privacy & Security

This app:
- Does NOT store facial data
- Does NOT upload your photos/videos
- Does NOT share personal information
- Processes everything locally

## 📈 Future Improvements

1. Offline support via PWA
2. More mood categories
3. Music recommendations
4. Collaborative playlists
5. Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TensorFlow.js team
- Web Audio API community
- Tailwind CSS team
- Netlify for hosting
- All contributors

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting guide above
2. Open an issue on GitHub
3. Contact: mrprince419@github.com

## 🔄 Version History

- v1.0.0 - Initial release
  - Basic mood detection
  - Music playback
  - Playlist management

- v1.1.0 - Web Version
  - Moved to web-only version
  - Added real-time mood tracking
  - Improved UI/UX
  - Added drag-and-drop support
