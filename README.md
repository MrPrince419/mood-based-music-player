# Mood Based Music Player

A smart music player that analyzes your mood through facial expressions and plays music that matches your emotional state.

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
- Python 3.8 or higher
- Webcam (built-in or external)
- Music files (MP3 or WAV format)
- Windows, macOS, or Linux operating system

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MrPrince419/mood-based-music-player.git
   cd mood-based-music-player
   ```

2. **Set up Python environment:**
   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   # Update pip to latest version
   python -m pip install --upgrade pip

   # Install required packages
   pip install -r requirements.txt
   ```

### Running the App

1. **Prepare your music:**
   - Place your music files in a directory
   - Supported formats: MP3, WAV

2. **Start the application:**
   ```bash
   python "mood based music player.py"
   ```

3. **Initial setup:**
   - Allow camera access when prompted
   - Select your music directory
   - Wait for initial music analysis to complete

4. **Using the player:**
   - Face the camera
   - The app will detect your mood
   - Music matching your emotional state will play
   - Playlist updates as your mood changes

## Troubleshooting Guide

### Camera Issues

1. **Camera Not Detected:**
   - Check if webcam is properly connected
   - Ensure no other apps are using the camera
   - Verify camera permissions in system settings
   ```bash
   # Test camera in Python
   python -c "import cv2; print(cv2.VideoCapture(0).isOpened())"
   ```

2. **Permission Denied:**
   - Grant camera access in system settings
   - Run the app with appropriate permissions
   - Try closing other apps using the camera

### Installation Problems

1. **Package Installation Fails:**
   ```bash
   # Try updating pip
   python -m pip install --upgrade pip

   # Install packages one by one
   pip install numpy
   pip install opencv-python
   pip install pygame
   ```

2. **Virtual Environment Issues:**
   ```bash
   # Remove and recreate environment
   deactivate
   rm -rf venv  # On Windows: rmdir /s /q venv
   python -m venv venv
   ```

### Music Playback Problems

1. **No Sound:**
   - Check system volume
   - Verify audio device selection
   - Ensure music files are not corrupted
   ```bash
   # Test audio playback
   python -c "import pygame; pygame.mixer.init(); pygame.mixer.music.load('path/to/music.mp3')"
   ```

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
