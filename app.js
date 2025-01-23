// Environment Configuration
const CONFIG = {
    ENABLE_FACE_DETECTION: true, // Default to true if env var not available
    MAX_UPLOAD_SIZE: 50000000,   // 50MB default
    MOOD_CONFIDENCE_THRESHOLD: 0.7,
    MOOD_UPDATE_INTERVAL: 1000,
    MAX_MOOD_HISTORY: 10
};

// Constants
const MOOD_CONFIDENCE_THRESHOLD = CONFIG.MOOD_CONFIDENCE_THRESHOLD;
const MOOD_UPDATE_INTERVAL = CONFIG.MOOD_UPDATE_INTERVAL;
const MAX_MOOD_HISTORY = CONFIG.MAX_MOOD_HISTORY;

// Initialize webcam
async function setupWebcam() {
    const video = document.getElementById('webcam');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
        });
        video.srcObject = stream;
        return new Promise(resolve => video.onloadedmetadata = () => resolve(video));
    } catch (error) {
        console.error('Error accessing webcam:', error);
        document.getElementById('moodDisplay').textContent = 'Camera Error';
        throw error;
    }
}

// Initialize face detection models
async function loadModels() {
    try {
        const faceDetector = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            { runtime: 'mediapipe' }
        );
        const landmarkDetector = await faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            { runtime: 'mediapipe' }
        );
        return { faceDetector, landmarkDetector };
    } catch (error) {
        console.error('Error loading models:', error);
        throw error;
    }
}

// Advanced mood detection using facial landmarks
async function detectMood(detectors, video) {
    const { faceDetector, landmarkDetector } = detectors;
    const faces = await faceDetector.estimateFaces(video, {
        flipHorizontal: false
    });
    
    if (faces.length > 0) {
        const landmarks = await landmarkDetector.estimateFaces(video);
        if (landmarks.length > 0) {
            // Analyze facial features for mood
            const mood = analyzeFacialFeatures(landmarks[0]);
            updateMoodDisplay(mood);
            return mood;
        }
    }
    return null;
}

// Analyze facial features to determine mood
function analyzeFacialFeatures(landmarks) {
    // Advanced mood detection logic using facial landmarks
    const eyeOpenness = calculateEyeOpenness(landmarks);
    const mouthCurvature = calculateMouthCurvature(landmarks);
    const browPosition = calculateBrowPosition(landmarks);
    
    // Determine mood based on facial features
    const moods = {
        'Happy': mouthCurvature > 0.6 && browPosition > 0.5,
        'Sad': mouthCurvature < 0.4 && browPosition < 0.4,
        'Energetic': eyeOpenness > 0.7 && mouthCurvature > 0.5,
        'Relaxed': eyeOpenness < 0.5 && mouthCurvature > 0.4,
        'Focused': eyeOpenness > 0.6 && Math.abs(browPosition - 0.5) < 0.1
    };
    
    // Find the most likely mood
    let maxConfidence = 0;
    let detectedMood = 'Neutral';
    
    for (const [mood, condition] of Object.entries(moods)) {
        const confidence = calculateMoodConfidence(condition, eyeOpenness, mouthCurvature, browPosition);
        if (confidence > maxConfidence && confidence > MOOD_CONFIDENCE_THRESHOLD) {
            maxConfidence = confidence;
            detectedMood = mood;
        }
    }
    
    return {
        mood: detectedMood,
        confidence: maxConfidence
    };
}

// Helper functions for facial analysis
function calculateEyeOpenness(landmarks) {
    // Calculate eye openness using landmark positions
    return Math.random(); // Placeholder
}

function calculateMouthCurvature(landmarks) {
    // Calculate mouth curvature using landmark positions
    return Math.random(); // Placeholder
}

function calculateBrowPosition(landmarks) {
    // Calculate eyebrow position using landmark positions
    return Math.random(); // Placeholder
}

function calculateMoodConfidence(condition, eyeOpenness, mouthCurvature, browPosition) {
    // Calculate confidence score for mood detection
    return Math.random(); // Placeholder
}

// Music player functionality
class MusicPlayer {
    constructor() {
        this.songs = new Map(); // mood -> [songs]
        this.currentMood = null;
        this.audioPlayer = document.getElementById('audioPlayer');
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isShuffled = false;
        this.repeatMode = 'none'; // none, one, all
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Playback controls
        document.getElementById('playPause').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('next').addEventListener('click', () => this.playNext());
        document.getElementById('previous').addEventListener('click', () => this.playPrevious());
        document.getElementById('shuffle').addEventListener('click', () => this.toggleShuffle());
        document.getElementById('repeat').addEventListener('click', () => this.toggleRepeat());

        // Progress bar
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                if (this.audioPlayer) {
                    this.audioPlayer.currentTime = pos * this.audioPlayer.duration;
                }
            });
        }

        // Audio player events
        if (this.audioPlayer) {
            this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
            this.audioPlayer.addEventListener('ended', () => this.handleSongEnd());
        }

        // File upload handling
        const fileInput = document.getElementById('fileInput');
        const dropZone = document.getElementById('dropZone');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                    this.handleFileUpload(Array.from(files));
                }
            });
        }

        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('bg-gray-700');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('bg-gray-700');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('bg-gray-700');
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                    this.handleFileUpload(Array.from(files));
                }
            });
        }
    }

    async handleFileUpload(files) {
        for (const file of files) {
            try {
                // Check file size
                if (file.size > CONFIG.MAX_UPLOAD_SIZE) {
                    throw new Error(`File ${file.name} is too large. Maximum size is ${CONFIG.MAX_UPLOAD_SIZE / 1000000}MB`);
                }

                const url = URL.createObjectURL(file);
                const mood = await this.analyzeMusicMood(file);
                
                if (!this.songs.has(mood)) {
                    this.songs.set(mood, []);
                }
                
                const metadata = await this.extractMetadata(file);
                this.songs.get(mood).push({
                    name: file.name,
                    url: url,
                    ...metadata
                });
            } catch (error) {
                console.error('Error processing file:', file.name, error);
                // Show error to user
                const errorDiv = document.createElement('div');
                errorDiv.className = 'bg-red-500 text-white p-4 rounded-lg mb-4';
                errorDiv.textContent = error.message;
                document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.grid'));
                setTimeout(() => errorDiv.remove(), 5000);
            }
        }
        this.updatePlaylist();
    }

    async analyzeMusicMood(file) {
        // In a real app, we'd analyze the audio features
        // For now, we'll guess from the filename or return a random mood
        const moods = ['Happy', 'Sad', 'Energetic', 'Relaxed', 'Focused'];
        return moods[Math.floor(Math.random() * moods.length)];
    }

    async extractMetadata(file) {
        // In a real app, we'd extract actual metadata
        return {
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            duration: '0:00'
        };
    }

    updatePlaylist() {
        const playlist = document.getElementById('playlist');
        playlist.innerHTML = '';
        
        this.songs.forEach((songs, mood) => {
            const moodSection = document.createElement('div');
            moodSection.className = 'mb-6';
            
            const header = document.createElement('div');
            header.className = 'flex items-center mb-2';
            header.innerHTML = `
                <h4 class="text-lg font-bold">${mood}</h4>
                <span class="ml-2 text-sm text-gray-400">(${songs.length} songs)</span>
            `;
            
            const songList = document.createElement('div');
            songList.className = 'space-y-2';
            
            songs.forEach((song, index) => {
                const songItem = document.createElement('div');
                songItem.className = 'flex items-center p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors';
                songItem.innerHTML = `
                    <i class="fas fa-music mr-3 text-gray-400"></i>
                    <div class="flex-1">
                        <div class="font-medium">${song.name.replace(/\.[^/.]+$/, '')}</div>
                        <div class="text-sm text-gray-400">${song.artist}</div>
                    </div>
                    <div class="text-sm text-gray-400">${song.duration}</div>
                `;
                songItem.onclick = () => this.playSong(song);
                songList.appendChild(songItem);
            });
            
            moodSection.appendChild(header);
            moodSection.appendChild(songList);
            playlist.appendChild(moodSection);
        });
    }

    playSong(song) {
        this.audioPlayer.src = song.url;
        this.audioPlayer.play();
        this.isPlaying = true;
        this.updatePlayPauseButton();
        this.updateNowPlaying(song);
    }

    updateNowPlaying(song) {
        document.getElementById('songTitle').textContent = song.name.replace(/\.[^/.]+$/, '');
        document.getElementById('artistName').textContent = song.artist;
        // Update album art if available
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audioPlayer.pause();
        } else {
            this.audioPlayer.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayPauseButton();
    }

    updatePlayPauseButton() {
        const btn = document.getElementById('playPause');
        btn.innerHTML = `<i class="fas fa-${this.isPlaying ? 'pause' : 'play'}"></i>`;
    }

    updateProgress() {
        const currentTime = document.getElementById('currentTime');
        const duration = document.getElementById('duration');
        const progressBar = document.getElementById('progressBar');
        
        currentTime.textContent = this.formatTime(this.audioPlayer.currentTime);
        duration.textContent = this.formatTime(this.audioPlayer.duration);
        
        const percent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        progressBar.style.width = `${percent}%`;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    playMoodBasedSong(mood) {
        if (!this.songs.has(mood.mood)) return;
        const moodSongs = this.songs.get(mood.mood);
        if (moodSongs.length === 0) return;
        
        const index = this.isShuffled ? 
            Math.floor(Math.random() * moodSongs.length) : 
            this.currentSongIndex % moodSongs.length;
        
        this.playSong(moodSongs[index]);
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        const btn = document.getElementById('shuffle');
        btn.classList.toggle('text-purple-400');
    }

    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        this.repeatMode = modes[(modes.indexOf(this.repeatMode) + 1) % modes.length];
        
        const btn = document.getElementById('repeat');
        btn.classList.toggle('text-purple-400', this.repeatMode !== 'none');
    }

    handleSongEnd() {
        if (this.repeatMode === 'one') {
            this.audioPlayer.play();
        } else if (this.repeatMode === 'all') {
            this.playNext();
        } else {
            this.currentSongIndex++;
            if (this.currentSongIndex >= this.getCurrentPlaylist().length) {
                this.currentSongIndex = 0;
            }
            this.playNext();
        }
    }

    getCurrentPlaylist() {
        return this.currentMood ? 
            this.songs.get(this.currentMood.mood) || [] : 
            Array.from(this.songs.values()).flat();
    }

    playNext() {
        const playlist = this.getCurrentPlaylist();
        if (playlist.length === 0) return;
        
        if (this.isShuffled) {
            const randomIndex = Math.floor(Math.random() * playlist.length);
            this.playSong(playlist[randomIndex]);
        } else {
            this.currentSongIndex = (this.currentSongIndex + 1) % playlist.length;
            this.playSong(playlist[this.currentSongIndex]);
        }
    }

    playPrevious() {
        const playlist = this.getCurrentPlaylist();
        if (playlist.length === 0) return;
        
        if (this.isShuffled) {
            const randomIndex = Math.floor(Math.random() * playlist.length);
            this.playSong(playlist[randomIndex]);
        } else {
            this.currentSongIndex = (this.currentSongIndex - 1 + playlist.length) % playlist.length;
            this.playSong(playlist[this.currentSongIndex]);
        }
    }
}

// Mood history management
class MoodHistory {
    constructor() {
        this.history = [];
        this.container = document.getElementById('moodHistory');
    }

    add(mood) {
        this.history.unshift({
            mood: mood.mood,
            confidence: mood.confidence,
            timestamp: new Date()
        });
        
        if (this.history.length > MAX_MOOD_HISTORY) {
            this.history.pop();
        }
        
        this.update();
    }

    update() {
        this.container.innerHTML = '';
        
        this.history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-2 rounded-lg bg-gray-700';
            
            const time = new Date(entry.timestamp).toLocaleTimeString();
            item.innerHTML = `
                <div class="flex items-center">
                    <span class="font-medium">${entry.mood}</span>
                    <span class="ml-2 text-sm text-gray-400">${time}</span>
                </div>
                <div class="text-sm text-gray-400">${Math.round(entry.confidence * 100)}%</div>
            `;
            
            this.container.appendChild(item);
        });
    }
}

// Main app initialization
async function init() {
    try {
        if (!CONFIG.ENABLE_FACE_DETECTION) {
            throw new Error('Face detection is currently disabled');
        }

        const video = await setupWebcam();
        const detectors = await loadModels();
        const player = new MusicPlayer();
        const moodHistory = new MoodHistory();

        // Main detection loop
        async function detectLoop() {
            const mood = await detectMood(detectors, video);
            if (mood) {
                document.getElementById('moodConfidence').style.width = `${mood.confidence * 100}%`;
                moodHistory.add(mood);
                
                if (mood.mood !== player.currentMood?.mood) {
                    player.currentMood = mood;
                    player.playMoodBasedSong(mood);
                }
            }
            setTimeout(detectLoop, CONFIG.MOOD_UPDATE_INTERVAL);
        }

        detectLoop();
    } catch (error) {
        console.error('Error initializing app:', error);
        document.getElementById('moodDisplay').textContent = 'Error: ' + error.message;
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-500 text-white p-4 rounded-lg mb-4';
        errorDiv.textContent = error.message;
        document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.grid'));
    }
}

init();
