# Mood Based Music Player

A web-based music player that analyzes your mood through facial expressions and plays music that matches your emotional state. Now available as a web application!

## Web Version

The web version runs directly in your browser - no installation required!

### Features
- Real-time mood detection using your webcam
- Browser-based music playback
- Drag-and-drop music upload
- Automatic mood-based playlist organization
- Works on any device with a webcam and modern browser

### Using the Web Version
1. Visit [https://mrprince419-mood-music-player.netlify.app](https://mrprince419-mood-music-player.netlify.app)
2. Allow camera access when prompted
3. Upload your music files
4. Face the camera and enjoy mood-based music!

### Web Version Troubleshooting

#### Camera Issues
1. **Camera Not Working:**
   - Ensure you've allowed camera permissions in your browser
   - Try refreshing the page
   - Check if other apps are using your camera
   - Verify your webcam works in other applications

2. **Permission Denied:**
   - Click the camera icon in your browser's address bar
   - Select "Allow" for camera access
   - Try using a different browser (Chrome, Firefox, Edge)

#### Music Playback
1. **Can't Upload Music:**
   - Ensure files are in MP3 format
   - Check file size (max 50MB per file)
   - Try uploading fewer files at once
   - Clear browser cache and try again

2. **No Sound:**
   - Check browser volume
   - Verify system audio is working
   - Try playing a YouTube video to test audio
   - Check if audio is muted in the player

#### Browser Compatibility
- **Recommended Browsers:**
  - Chrome 80+
  - Firefox 76+
  - Edge 80+
  - Safari 13+

- **If Using Unsupported Browser:**
  - Update to latest version
  - Try a different supported browser
  - Clear browser cache and cookies

#### Performance Issues
1. **Slow or Laggy:**
   - Close unnecessary browser tabs
   - Refresh the page
   - Clear browser cache
   - Check internet connection
   - Reduce number of uploaded songs

2. **High CPU Usage:**
   - Close other resource-intensive tabs
   - Reduce the number of active browser extensions
   - Try using hardware acceleration if available

## Features

### Mood Detection
- Real-time facial expression analysis
- Continuous mood tracking
- Emotion confidence scores
- Visual mood indicators

### Music Analysis
- Audio feature extraction
- Mood-based song categorization
- Dynamic playlist generation
- Beat and tempo analysis

### Reactive Interface
- Real-time mood visualization
- Live playlist updates
- Instant playback controls
- Visual audio wavelength display

## Quick Start Guide

### Prerequisites
- Webcam (built-in or external)
- Music files (MP3 or WAV format)
- Modern browser (Chrome, Firefox, Edge, Safari)

### Using the App

1. **Visit the Web App:**
   - Go to [https://mrprince419-mood-music-player.netlify.app](https://mrprince419-mood-music-player.netlify.app)

2. **Allow Camera Access:**
   - When prompted, allow access to your webcam

3. **Upload Music:**
   - Drag and drop music files
   - Or click the upload button

4. **Start Listening:**
   - Face the camera
   - Your mood will be detected automatically
   - Music matching your mood will play

## Troubleshooting Guide

### Camera Issues

1. **Camera Not Detected:**
   - Check if webcam is properly connected
   - Ensure no other apps are using the camera
   - Verify camera permissions in system settings

2. **Permission Denied:**
   - Grant camera access in system settings
   - Run the app with appropriate permissions
   - Try closing other apps using the camera

### Music Playback Problems

1. **No Sound:**
   - Check system volume
   - Verify audio device selection
   - Ensure music files are not corrupted

2. **File Format Errors:**
   - Convert files to supported formats
   - Check file permissions
   - Verify file paths have no special characters

### Performance Issues

1. **Slow Performance:**
   - Close unnecessary background applications
   - Reduce video resolution in settings
   - Update graphics drivers

2. **High CPU Usage:**
   - Lower the mood detection frequency
   - Reduce number of songs in playlist
   - Close other resource-intensive applications

## Common Error Messages

1. **"No module named 'cv2'":**
   ```bash
   pip install opencv-python
   ```

2. **"No module named 'pygame'":**
   ```bash
   pip install pygame
   ```

3. **"Camera index out of range":**
   - Check camera connection
   - Try different camera index (0, 1, 2)
   ```python
   # In the code, try different indices
   cv2.VideoCapture(1)  # or 2, 3, etc.
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

MrPrince419 - [@MrPrince419](https://github.com/MrPrince419)

Project Link: [https://github.com/MrPrince419/mood-based-music-player](https://github.com/MrPrince419/mood-based-music-player)
