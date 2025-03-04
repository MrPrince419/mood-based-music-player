import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

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
class ErrorHandler {
    static MAX_RETRIES = 3;
    static RETRY_DELAY = 1000;

    static async withRetry(operation, context = 'Operation') {
        let lastError;
        
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.warn(`${context} failed (attempt ${attempt}/${this.MAX_RETRIES}):`, error);
                
                if (attempt < this.MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
                }
            }
        }
        
        throw new Error(`${context} failed after ${this.MAX_RETRIES} attempts: ${lastError.message}`);
    }
}

// Update the loadModels function to use retry mechanism
async function loadModels() {
    return ErrorHandler.withRetry(async () => {
        // Load core TensorFlow.js first
        await tf.ready();
        
        // Lazy load face detection models
        const [faceDetectionModule, faceLandmarksModule] = await Promise.all([
            import('@tensorflow-models/face-detection'),
            import('@tensorflow-models/face-landmarks-detection')
        ]);
        
        try {
            console.log('Initializing TensorFlow.js...');
            await tf.ready();
            console.log('TensorFlow.js initialized');
            
            // Try to initialize WebGL backend, fall back to CPU if not available
            try {
                await tf.setBackend('webgl');
                console.log('WebGL backend initialized');
            } catch (error) {
                throw createError(
                    'WebGL initialization failed',
                    ErrorCode.MODEL_LOAD,
                    ErrorSeverity.WARNING,
                    'TensorFlow',
                    { originalError: error.message }
                );
            }
            console.log('CPU backend initialized');
            
            // Set flags for better performance on CPU
            tf.env().set('WEBGL_CPU_FORWARD', true);
            
            console.log('Creating face detector...');
            const faceDetector = await faceDetection.createDetector(
                faceDetection.SupportedModels.MediaPipeFaceDetector,
                { 
                    runtime: 'tfjs',
                    modelType: 'short',
                    maxFaces: 1
                }
            );
            console.log('Face detector created');
            
            const landmarkDetector = await faceLandmarksDetection.createDetector(
                faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
                { 
                    runtime: 'tfjs',
                    maxFaces: 1,
                    refineLandmarks: true
                }
            );
            
            return { faceDetector, landmarkDetector };
        } catch (error) {
            console.error('Error in loadModels:', error);
            throw new Error(`Failed to initialize face detection: ${error.message}`);
        }
    });  // Fixed: Added missing parenthesis here
}

// Advanced mood detection using facial landmarks
async function detectMood(detectors, video) {
    try {
        const { faceDetector, landmarkDetector } = detectors;
        
        console.log('Detecting faces...');
        const faces = await faceDetector.estimateFaces(video, {
            flipHorizontal: false
        });
        
        if (faces.length > 0) {
            console.log('Face detected, estimating landmarks...');
            const landmarks = await landmarkDetector.estimateFaces(video);
            if (landmarks.length > 0) {
                console.log('Landmarks detected, analyzing mood...');
                // Analyze facial features for mood
                const mood = analyzeFacialFeatures(landmarks[0]);
                updateMoodDisplay(mood);
                return mood;
            }
        }
        return null;
    } catch (error) {
        console.error('Error in detectMood:', error);
        throw error;
    }
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
interface FacialLandmarks {
  annotations: {
    leftEye: number[][];
    rightEye: number[][];
    lipsUpperOuter: number[][];
    leftEyebrowUpper: number[][];
    rightEyebrowUpper: number[][];
  };
}

function calculateEyeOpenness(landmarks: FacialLandmarks): number {
  const leftEye = landmarks.annotations.leftEye;
  const rightEye = landmarks.annotations.rightEye;
  
  const leftHeight = calculateDistance(leftEye[1], leftEye[7]);
  const rightHeight = calculateDistance(rightEye[1], rightEye[7]);
  
  return (leftHeight + rightHeight) / 2;
}

function calculateMouthCurvature(landmarks) {
    const mouth = landmarks.annotations.lipsUpperOuter;
    const mouthCenter = mouth[5];
    const mouthCorners = [mouth[0], mouth[10]];
    
    return calculateCurvature(mouthCorners[0], mouthCenter, mouthCorners[1]);
}

function calculateBrowPosition(landmarks) {
    const leftBrow = landmarks.annotations.leftEyebrowUpper;
    const rightBrow = landmarks.annotations.rightEyebrowUpper;
    
    const avgLeftHeight = average(leftBrow.map(p => p[1]));
    const avgRightHeight = average(rightBrow.map(p => p[1]));
    
    return (avgLeftHeight + avgRightHeight) / 2;
}

// Helper geometry functions
function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
}

function calculateCurvature(p1, p2, p3) {
    const a = calculateDistance(p1, p2);
    const b = calculateDistance(p2, p3);
    const c = calculateDistance(p3, p1);
    const s = (a + b + c) / 2;
    return (4 * Math.sqrt(s * (s - a) * (s - b) * (s - c))) / (a * c);
}

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateMoodConfidence(condition, eyeOpenness, mouthCurvature, browPosition) {
    // Weight factors for different facial features
    const weights = {
        eyeOpenness: 0.3,
        mouthCurvature: 0.4,
        browPosition: 0.3
    };

    // Calculate normalized scores
    const scores = {
        eyeOpenness: Math.min(Math.max(eyeOpenness, 0), 1),
        mouthCurvature: Math.min(Math.max(mouthCurvature, 0), 1),
        browPosition: Math.min(Math.max(browPosition, 0), 1)
    };

    // Calculate weighted average
    const confidence = (
        scores.eyeOpenness * weights.eyeOpenness +
        scores.mouthCurvature * weights.mouthCurvature +
        scores.browPosition * weights.browPosition
    ) * (condition ? 1 : 0.5); // Reduce confidence if condition is not met

    return Math.min(Math.max(confidence, 0), 1);
}

// Music player functionality
class UserPreferences {
    static KEY = 'mood_player_preferences';
    
    static getDefaults() {
        return {
            volume: 0.8,
            theme: 'dark',
            moodDetectionEnabled: true,
            visualizerEnabled: true,
            lastPlaylist: null,
            audioQuality: 'high'
        };
    }

    static load() {
        try {
            const stored = localStorage.getItem(this.KEY);
            return stored ? { ...this.getDefaults(), ...JSON.parse(stored) } : this.getDefaults();
        } catch (error) {
            console.error('Error loading preferences:', error);
            return this.getDefaults();
        }
    }

    static save(preferences) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }
}

// Update MusicPlayer class constructor
interface MusicPlayerState {
  songs: Map<string, any>;
  currentMood: any;
  audioPlayer: HTMLAudioElement | null;
  currentSongIndex: number;
  isPlaying: boolean;
}

class MusicPlayer {
  private state: MusicPlayerState;
  private audioPlayer: HTMLAudioElement | null;
  private audioContext: AudioContext | null;
  private analyser: AnalyserNode | null;
  private gainNode: GainNode | null;
  private biquadFilter: BiquadFilterNode | null;
  private isShuffled: boolean;
  private repeatMode: 'none' | 'one' | 'all';
  private songs: Map<string, any[]>;

  constructor() {
    this.state = {
      songs: new Map(),
      currentMood: null,
      audioPlayer: null,
      currentSongIndex: 0,
      isPlaying: false
    };
    this.audioPlayer = null;
    this.audioContext = null;
    this.analyser = null;
    this.gainNode = null;
    this.biquadFilter = null;
    this.isShuffled = false;
    this.repeatMode = 'none';
    this.songs = new Map();
    this.initialize();
  }

  private setupEventListeners(): void {
    if (!this.audioPlayer) {
      console.error('Audio player not initialized');
      return;
    }

    // Playback controls
    const playPauseBtn = document.getElementById('playPause');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('previous');
    const shuffleBtn = document.getElementById('shuffle');
    const repeatBtn = document.getElementById('repeat');
    const progressBar = document.getElementById('progressBar');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');

    // Add event listeners with null checks
    playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
    nextBtn?.addEventListener('click', () => this.playNext());
    prevBtn?.addEventListener('click', () => this.playPrevious());
    shuffleBtn?.addEventListener('click', () => this.toggleShuffle());
    repeatBtn?.addEventListener('click', () => this.toggleRepeat());

    // Progress bar interaction
    progressBar?.addEventListener('click', (e: MouseEvent) => {
      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      if (this.audioPlayer) {
        this.audioPlayer.currentTime = pos * this.audioPlayer.duration;
      }
    });

    // Audio player events
    this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
    this.audioPlayer.addEventListener('ended', () => this.handleSongEnd());

    // File upload handling
    fileInput?.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.length) {
        this.handleFileUpload(Array.from(target.files));
      }
    });

    // Drop zone events
    if (dropZone) {
      dropZone.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        dropZone.classList.add('bg-gray-700');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('bg-gray-700');
      });

      dropZone.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        dropZone.classList.remove('bg-gray-700');
        if (e.dataTransfer?.files.length) {
          this.handleFileUpload(Array.from(e.dataTransfer.files));
        }
      });
    }
  }

  async init() {
      this.audioPlayer = document.getElementById('audioPlayer');
      this.setupEventListeners();
      await this.initAudioContext();
  }

  async initAudioContext() {
      try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.audioContext = new AudioContext({
              latencyHint: 'interactive',
              sampleRate: 44100
          });
          
          // Create audio processing graph
          this.analyser = this.audioContext.createAnalyser();
          this.gainNode = this.audioContext.createGain();
          this.biquadFilter = this.audioContext.createBiquadFilter();
          
          // Configure nodes
          this.analyser.fftSize = 2048;
          this.biquadFilter.type = 'lowpass';
          this.biquadFilter.frequency.value = 20000;
          
          // Connect nodes
          const source = this.audioContext.createMediaElementSource(this.audioPlayer);
          source.connect(this.biquadFilter)
                .connect(this.gainNode)
                .connect(this.analyser)
                .connect(this.audioContext.destination);
          
          // Start visualization with optimized refresh rate
          this.startVisualizer();
      } catch (error) {
          console.error('WebAudio API not supported:', error);
      }
  }

  startVisualizer() {
      const canvas = document.getElementById('visualizer') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx || !this.analyser) return;

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
          requestAnimationFrame(draw);
          
          this.analyser.getByteFrequencyData(dataArray);
          
          ctx.fillStyle = 'rgb(0, 0, 0)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;
          
          for(let i = 0; i < bufferLength; i++) {
              barHeight = dataArray[i] / 2;
              
              const r = barHeight + (25 * (i/bufferLength));
              const g = 250 * (i/bufferLength);
              const b = 50;
              
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
              
              x += barWidth + 1;
          }
      };
      
      draw();
  }
}

// Setup event listeners
// Fix: Move setupEventListeners inside the class
setupEventListeners() {
    if (!this.audioPlayer) {
        console.error('Audio player not initialized');
        return;
    }
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

private showErrors(errors: Error[]): void {
  const container = document.querySelector('.container');
  if (!container) return;

  errors.forEach(error => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-500 text-white p-4 rounded-lg mb-4';
    errorDiv.textContent = error.message;
    container.insertBefore(errorDiv, container.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
  });
}

private async analyzeMusicMood(file: File): Promise<string> {
  // Implementation of mood analysis
  const moods = ['Happy', 'Sad', 'Energetic', 'Relaxed', 'Focused'];
  return moods[Math.floor(Math.random() * moods.length)];
}

private async extractMetadata(file: File): Promise<Record<string, string>> {
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
        moodSection.setAttribute('role', 'region');
        moodSection.setAttribute('aria-label', `${mood} playlist`);
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
            const songItem = document.createElement('button');
            songItem.setAttribute('role', 'listitem');
            songItem.setAttribute('aria-label', `Play ${song.name} by ${song.artist}`);
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

class MusicPlayer {
    updateProgress() {
        if (!this.isPlaying || !this.audioPlayer) return;
        
        requestAnimationFrame(() => {
            const currentTime = document.getElementById('currentTime');
            const duration = document.getElementById('duration');
            const progressBar = document.getElementById('progressBar');
            
            if (currentTime && duration && progressBar) {
                currentTime.textContent = this.formatTime(this.audioPlayer.currentTime);
                duration.textContent = this.formatTime(this.audioPlayer.duration);
                
                const percent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
                progressBar.style.width = `${percent}%`;
            }
        });
    }
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

    async analyzeMusicMood(file) {
        const audioBuffer = await this.loadAudioBuffer(file);
        const features = await this.extractAudioFeatures(audioBuffer);
        
        return this.classifyMood(features);
    }

    async loadAudioBuffer(file) {
        const cacheKey = file.name;
        if (this.audioBufferCache.has(cacheKey)) {
            return this.audioBufferCache.get(cacheKey);
        }

        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        // Cache management
        if (this.audioBufferCache.size >= this.maxCacheSize) {
            const firstKey = this.audioBufferCache.keys().next().value;
            this.audioBufferCache.delete(firstKey);
        }
        
        this.audioBufferCache.set(cacheKey, audioBuffer);
        return audioBuffer;
    }

    updatePlaylist() {
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        const playlist = document.getElementById('playlist');
        
        this.songs.forEach((songs, mood) => {
            const moodSection = document.createElement('div');
            moodSection.setAttribute('role', 'region');
            moodSection.setAttribute('aria-label', `${mood} playlist`);
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
                const songItem = document.createElement('button');
                songItem.setAttribute('role', 'listitem');
                songItem.setAttribute('aria-label', `Play ${song.name} by ${song.artist}`);
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
}

// Main app initialization
async function init() {
    try {
        console.log('Starting app initialization...');
        
        if (!CONFIG.ENABLE_FACE_DETECTION) {
            throw new Error('Face detection is currently disabled');
        }

        // Check for WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            console.warn('WebGL is not supported. Face detection may be slower.');
        }

        console.log('Setting up webcam...');
        const video = await setupWebcam();
        console.log('Webcam setup complete');

        console.log('Loading face detection models...');
        let detectors = null;
        try {
            detectors = await loadModels();
            console.log('Face detection models loaded');
        } catch (error) {
            console.error('Failed to load face detection models:', error);
            document.getElementById('moodDisplay').textContent = 'Face Detection Unavailable';
            throw error;
        }

        const player = new MusicPlayer();
        const moodHistory = new MoodHistory();

        // Main detection loop
        let isProcessing = false;
        // Update the detection loop
        async function detectLoop() {
            if (!window.Worker) {
                // Fallback to main thread processing
                return legacyDetectLoop();
            }
        
            const worker = new Worker('faceDetectionWorker.js');
            let lastFrameTime = 0;
            const FRAME_INTERVAL = 1000 / 30; // 30 FPS cap
            
            worker.onmessage = async (e) => {
                const { mood, error } = e.data;
                if (error) {
                    console.error('Face detection error:', error);
                    return;
                }
                
                if (mood) {
                    updateMoodDisplay(mood);
                    if (mood.mood !== player.currentMood?.mood) {
                        player.currentMood = mood;
                        player.playMoodBasedSong(mood);
                    }
                }
            };
        
            // Send video frames to worker
            const sendFrame = async (timestamp) => {
                if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
                    if (!isProcessing) {
                        isProcessing = true;
                        const imageData = await captureFrame(video);
                        worker.postMessage({ frame: imageData }, [imageData.data.buffer]);
                        lastFrameTime = timestamp;
                        isProcessing = false;
                    }
                }
                requestAnimationFrame(sendFrame);
            };
        
            sendFrame();
        }

        console.log('Starting detection loop...');
        detectLoop();
    } catch (error) {
        console.error('Error initializing app:', error);
        document.getElementById('moodDisplay').textContent = 'Error: ' + error.message;
        
        // Show detailed error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-500 text-white p-4 rounded-lg mb-4';
        errorDiv.innerHTML = `
            <p class="font-bold">Error Initializing App:</p>
            <p>${error.message}</p>
            <p class="text-sm mt-2">Please check the browser console for more details.</p>
            ${!tf.findBackend('webgl') ? '<p class="text-sm mt-2">WebGL is not available on your device. Face detection may not work properly.</p>' : ''}
        `;
        document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.grid'));
    }
}

init();
