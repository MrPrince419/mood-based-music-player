import cv2
import numpy as np
import pygame
import tkinter as tk
from tkinter import ttk, filedialog
from PIL import Image, ImageTk
import tensorflow as tf
import librosa
import threading
import time
import json
import os
from pathlib import Path

class ModernButton(ttk.Button):
    def __init__(self, master, text, command=None, **kwargs):
        super().__init__(master, text=text, command=command, **kwargs)

class MoodBasedMusicPlayer:
    def __init__(self):
        # Initialize main window
        self.root = tk.Tk()
        self.root.title("Mood Based Music Player")
        self.root.geometry("1200x800")
        self.root.configure(bg='#1e1e2e')  # Dark theme background

        # Apply modern style
        self.style = ttk.Style()
        self.style.theme_use('default')  # Use default theme as base
        self.style.configure('TFrame', background='#1e1e2e')
        self.style.configure('TLabel', background='#1e1e2e', foreground='#ffffff')
        self.style.configure('TButton', padding=10)
        self.style.configure('Horizontal.TProgressbar', background='#2d2d3f')

        # State variables
        self.current_mood = None
        self.is_playing = False
        self.current_song = None
        self.songs_by_mood = {
            'happy': [], 'sad': [], 'energetic': [],
            'calm': [], 'focused': [], 'relaxed': []
        }
        self.mood_colors = {
            'happy': '#f7768e',     # Soft red
            'sad': '#7aa2f7',       # Soft blue
            'energetic': '#ff9e64', # Orange
            'calm': '#9ece6a',      # Green
            'focused': '#bb9af7',   # Purple
            'relaxed': '#73daca'    # Cyan
        }

        # Initialize camera
        self.camera = None
        self.camera_enabled = False
        try:
            self.camera = cv2.VideoCapture(0)
            if self.camera.isOpened():
                self.camera_enabled = True
            else:
                print("Could not open camera")
        except Exception as e:
            print(f"Camera error: {e}")

        # Initialize components
        self.setup_ui()
        self.setup_audio()
        self.load_music_library()
        
        # Start update loops
        self.start_mood_detection()
        self.update_ui()

    def setup_ui(self):
        # Main container with padding
        self.main_container = ttk.Frame(
            self.root,
            padding="20"
        )
        self.main_container.pack(fill=tk.BOTH, expand=True)

        # Left panel: Camera and Mood
        self.left_panel = ttk.Frame(
            self.main_container
        )
        self.left_panel.pack(side=tk.LEFT, fill=tk.BOTH, padx=(0, 20))

        # Camera preview with rounded corners
        self.camera_frame = ttk.Frame(
            self.left_panel
        )
        self.camera_frame.pack(fill=tk.BOTH, pady=(0, 20))
        
        self.camera_label = ttk.Label(
            self.camera_frame
        )
        self.camera_label.pack()

        # Mood display
        self.mood_frame = ttk.Frame(
            self.left_panel
        )
        self.mood_frame.pack(fill=tk.BOTH)
        
        self.mood_label = ttk.Label(
            self.mood_frame,
            text="Detecting mood...",
            font=('Segoe UI', 24)
        )
        self.mood_label.pack(pady=(0, 20))

        # Confidence bars with modern styling
        self.confidence_bars = {}
        for mood in self.songs_by_mood.keys():
            frame = ttk.Frame(self.mood_frame)
            frame.pack(fill=tk.X, pady=2)
            
            label = ttk.Label(
                frame,
                text=mood.capitalize(),
                font=('Segoe UI', 12)
            )
            label.pack(side=tk.LEFT, padx=5)
            
            progress = ttk.Progressbar(
                frame,
                length=200,
                mode='determinate'
            )
            progress.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
            
            self.confidence_bars[mood] = progress

        # Right panel: Playlist and Controls
        self.right_panel = ttk.Frame(
            self.main_container
        )
        self.right_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        # Current song info
        self.song_info_frame = ttk.Frame(
            self.right_panel
        )
        self.song_info_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.song_title = ttk.Label(
            self.song_info_frame,
            text="No song playing",
            font=('Segoe UI', 18)
        )
        self.song_title.pack()

        # Playlist with modern styling
        self.playlist_frame = ttk.Frame(
            self.right_panel
        )
        self.playlist_frame.pack(fill=tk.BOTH, expand=True)
        
        self.playlist = tk.Listbox(
            self.playlist_frame,
            bg='#2d2d3f',
            fg='#ffffff',
            selectmode=tk.SINGLE,
            font=('Segoe UI', 12),
            borderwidth=0,
            highlightthickness=0,
            selectbackground='#7aa2f7',
            selectforeground='#ffffff'
        )
        self.playlist.pack(fill=tk.BOTH, expand=True)

        # Modern control buttons
        self.controls_frame = ttk.Frame(
            self.right_panel
        )
        self.controls_frame.pack(fill=tk.X, pady=20)

        # Create buttons with text instead of icons
        self.play_button = ModernButton(
            self.controls_frame,
            text="Play",
            command=self.toggle_playback
        )
        self.play_button.pack(side=tk.LEFT, padx=5)

        self.next_button = ModernButton(
            self.controls_frame,
            text="Next",
            command=self.play_next
        )
        self.next_button.pack(side=tk.LEFT, padx=5)

        self.add_button = ModernButton(
            self.controls_frame,
            text="Add Music",
            command=self.add_music
        )
        self.add_button.pack(side=tk.LEFT, padx=5)

        # Progress bar with modern styling
        self.progress_frame = ttk.Frame(
            self.right_panel
        )
        self.progress_frame.pack(fill=tk.X)
        
        self.progress_bar = ttk.Progressbar(
            self.progress_frame,
            length=400,
            mode='determinate'
        )
        self.progress_bar.pack(fill=tk.X, pady=(0, 5))
        
        self.time_label = ttk.Label(
            self.progress_frame,
            text="0:00 / 0:00",
            font=('Segoe UI', 10)
        )
        self.time_label.pack()

        # Volume control with modern styling
        self.volume_frame = ttk.Frame(
            self.right_panel
        )
        self.volume_frame.pack(fill=tk.X, pady=(20, 0))
        
        self.volume_icon = ModernButton(
            self.volume_frame,
            text="Volume",
            command=None
        )
        self.volume_icon.pack(side=tk.LEFT, padx=(0, 10))
        
        self.volume_scale = ttk.Scale(
            self.volume_frame,
            from_=0,
            to=100,
            orient=tk.HORIZONTAL,
            command=self.update_volume
        )
        self.volume_scale.set(70)
        self.volume_scale.pack(side=tk.LEFT, fill=tk.X, expand=True)

    def setup_audio(self):
        pygame.mixer.init()
        self.current_volume = 0.7
        pygame.mixer.music.set_volume(self.current_volume)

    def load_emotion_model(self):
        # Placeholder for emotion model loading
        return None

    def load_music_library(self):
        library_path = Path("music_library.json")
        if library_path.exists():
            with open(library_path, 'r') as f:
                self.songs_by_mood = json.load(f)

    def save_music_library(self):
        with open("music_library.json", 'w') as f:
            json.dump(self.songs_by_mood, f)

    def start_mood_detection(self):
        def detect_mood():
            while True:
                # Simulate mood detection (replace with actual model)
                moods = {
                    'happy': np.random.random(),
                    'sad': np.random.random(),
                    'energetic': np.random.random(),
                    'calm': np.random.random(),
                    'focused': np.random.random(),
                    'relaxed': np.random.random()
                }
                
                # Update confidence bars
                for mood, confidence in moods.items():
                    self.confidence_bars[mood]['value'] = confidence * 100
                
                # Set current mood
                current_mood = max(moods.items(), key=lambda x: x[1])[0]
                if current_mood != self.current_mood:
                    self.current_mood = current_mood
                    self.mood_label.configure(
                        text=f"Current Mood: {current_mood.capitalize()}",
                        foreground=self.mood_colors[current_mood]
                    )
            
                time.sleep(0.03)  # ~30 FPS

        threading.Thread(target=detect_mood, daemon=True).start()

    def update_camera(self):
        if not self.camera_enabled:
            self.camera_label.configure(text="Camera not available\nClick 'Manual Mood' to select mood")
            return
        
        ret, frame = self.camera.read()
        if ret:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, (400, 300))
            photo = ImageTk.PhotoImage(image=Image.fromarray(frame))
            self.camera_label.configure(image=photo)
            self.camera_label.image = photo
        else:
            self.camera_label.configure(text="Camera error\nClick 'Manual Mood' to select mood")
            self.camera_enabled = False
            
        if self.camera_enabled:
            self.root.after(10, self.update_camera)

    def toggle_playback(self):
        if self.is_playing:
            pygame.mixer.music.pause()
            self.play_button['text'] = "Play"
        else:
            if not pygame.mixer.music.get_busy():
                self.play_next()
            else:
                pygame.mixer.music.unpause()
            self.play_button['text'] = "Pause"
        self.is_playing = not self.is_playing

    def play_next(self):
        if self.current_mood and self.songs_by_mood[self.current_mood]:
            song = self.songs_by_mood[self.current_mood][0]  # Get first song
            pygame.mixer.music.load(song)
            pygame.mixer.music.play()
            self.current_song = song
            self.song_title.configure(
                text=os.path.basename(song)
            )
            self.is_playing = True
            self.play_button['text'] = "Pause"

    def add_music(self):
        files = filedialog.askopenfilenames(
            title="Select Music Files",
            filetypes=[
                ("Audio Files", "*.mp3 *.wav")
            ]
        )
        if files:
            # For demo, add to current mood
            if self.current_mood:
                self.songs_by_mood[self.current_mood].extend(files)
                self.save_music_library()
                self.update_playlist()

    def update_volume(self, value):
        self.current_volume = float(value) / 100
        pygame.mixer.music.set_volume(self.current_volume)

    def update_playlist(self):
        self.playlist.delete(0, tk.END)
        if self.current_mood:
            for song in self.songs_by_mood[self.current_mood]:
                self.playlist.insert(tk.END, os.path.basename(song))

    def update_ui(self):
        if pygame.mixer.music.get_busy():
            # Update progress bar
            pos = pygame.mixer.music.get_pos() / 1000  # Convert to seconds
            self.progress_bar['value'] = (pos % 60) * 1.67  # Simple animation
            
            # Update time label
            minutes = int(pos // 60)
            seconds = int(pos % 60)
            self.time_label.configure(
                text=f"{minutes}:{seconds:02d} / 3:00"  # Placeholder duration
            )
        
        self.root.after(100, self.update_ui)

    def run(self):
        if self.camera_enabled:
            self.update_camera()
        self.root.mainloop()
        
        # Cleanup
        if self.camera_enabled and self.camera is not None:
            self.camera.release()

if __name__ == "__main__":
    app = MoodBasedMusicPlayer()
    try:
        app.run()
    finally:
        cv2.destroyAllWindows()