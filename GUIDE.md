# Mood-Based Music Player Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Features](#features)
- [Using the App](#using-the-app)
- [Music Library](#music-library)
- [Mood Detection](#mood-detection)
- [Best Practices](#best-practices)

## Getting Started

### Prerequisites
- Python 3.8 or higher
- Webcam for mood detection
- Music files (MP3 format)
- Required Python packages (see requirements.txt)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MrPrince419/mood-based-music-player.git
   cd mood-based-music-player
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python "mood based music player.py"
   ```

## Features

### Mood Categories
The player detects and plays music for six moods:
- Happy (Soft Red)
- Sad (Soft Blue)
- Energetic (Orange)
- Calm (Green)
- Focused (Purple)
- Relaxed (Cyan)

### Real-time Mood Detection
- Uses webcam for facial analysis
- Automatic mood updates
- Color-coded mood indicators
- Smooth transitions between moods

### Music Controls
- Play/Pause button
- Next/Previous track
- Volume control
- Progress bar
- Current song display

## Using the App

### Main Interface
1. Camera View
   - Shows webcam feed
   - Displays current mood
   - Color-coded mood indicator

2. Music Controls
   - Central control panel
   - Easy-to-use buttons
   - Visual feedback

3. Song Information
   - Current track name
   - Progress indicator
   - Mood category

### Adding Music
1. Click "Add Music" button
2. Select music files
3. Songs are automatically categorized
4. Library is saved for future use

### Playback Controls
1. Play/Pause
   - Toggle current playback
   - Visual state indicator

2. Navigation
   - Skip to next song
   - Return to previous song
   - Adjust volume

3. Progress
   - Track progress bar
   - Time elapsed/remaining
   - Visual playback status

## Music Library

### Supported Formats
- MP3 audio files
- Local music files
- Organized by mood

### Library Management
1. Add new songs
2. Songs are saved in library
3. Automatic mood categorization
4. Persistent across sessions

## Mood Detection

### How It Works
1. Camera captures face
2. AI analyzes expression
3. Mood is determined
4. Music matches mood

### Mood Colors
- Happy: Soft Red (#f7768e)
- Sad: Soft Blue (#7aa2f7)
- Energetic: Orange (#ff9e64)
- Calm: Green (#9ece6a)
- Focused: Purple (#bb9af7)
- Relaxed: Cyan (#73daca)

## Best Practices

### Optimal Usage
1. Good lighting for mood detection
2. Organize music by mood
3. Regular library updates
4. Keep camera unobstructed

### Music Organization
1. Use clear filenames
2. Add variety for each mood
3. Update library regularly
4. Remove unwanted tracks

### Performance Tips
1. Keep library organized
2. Good camera positioning
3. Adequate lighting
4. Regular updates
