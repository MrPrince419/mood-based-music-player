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
    def __init__(self, master, icon_path, command=None, **kwargs):
        super().__init__(master, command=command, **kwargs)
        self.icon_path = icon_path
        self.load_icon()
        
    def load_icon(self):
        if os.path.exists(self.icon_path):
            icon = Image.open(self.icon_path)
            icon = icon.resize((24, 24), Image.Resampling.LANCZOS)
            self.photo = ImageTk.PhotoImage(icon)
            self.configure(image=self.photo)

class MoodBasedMusicPlayer:
    def __init__(self):
        # Initialize main window
        self.root = tk.Tk()
        self.root.title("Mood Based Music Player")
        self.root.geometry("1200x800")
        self.root.configure(bg='#1e1e2e')  # Dark theme background

        # Apply modern style
        self.style = ttk.Style()
        self.style.configure(
            'Modern.TFrame',
            background='#1e1e2e'
        )
        self.style.configure(
            'Modern.TLabel',
            background='#1e1e2e',
            foreground='#ffffff'
        )
        self.style.configure(
            'Modern.TButton',
            padding=10,
            background='#2d2d3f',
            foreground='#ffffff'
        )
        self.style.configure(
            'Mood.TProgressbar',
            background='#7aa2f7',
            troughcolor='#2d2d3f'
        )

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

        # Initialize components
        self.setup_ui()
        self.setup_camera()
        self.setup_audio()
        self.load_music_library()
        
        # Start update loops
        self.start_mood_detection()
        self.update_ui()

    def setup_ui(self):
        # Main container with padding
        self.main_container = ttk.Frame(
            self.root,
            style='Modern.TFrame',
            padding="20"
        )
        self.main_container.pack(fill=tk.BOTH, expand=True)

        # Left panel: Camera and Mood
        self.left_panel = ttk.Frame(
            self.main_container,
            style='Modern.TFrame'
        )
        self.left_panel.pack(side=tk.LEFT, fill=tk.BOTH, padx=(0, 20))

        # Camera preview with rounded corners
        self.camera_frame = ttk.Frame(
            self.left_panel,
            style='Modern.TFrame'
        )
        self.camera_frame.pack(fill=tk.BOTH, pady=(0, 20))
        
        self.camera_label = ttk.Label(
            self.camera_frame,
            style='Modern.TLabel'
        )
        self.camera_label.pack()

        # Mood display
        self.mood_frame = ttk.Frame(
            self.left_panel,
            style='Modern.TFrame'
        )
        self.mood_frame.pack(fill=tk.BOTH)
        
        self.mood_label = ttk.Label(
            self.mood_frame,
            text="Detecting mood...",
            font=('Segoe UI', 24),
            style='Modern.TLabel'
        )
        self.mood_label.pack(pady=(0, 20))

        # Confidence bars with modern styling
        self.confidence_bars = {}
        for mood in self.songs_by_mood.keys():
            frame = ttk.Frame(self.mood_frame, style='Modern.TFrame')
            frame.pack(fill=tk.X, pady=2)
            
            label = ttk.Label(
                frame,
                text=mood.capitalize(),
                font=('Segoe UI', 12),
                style='Modern.TLabel'
            )
            label.pack(side=tk.LEFT, padx=5)
            
            progress = ttk.Progressbar(
                frame,
                length=200,
                mode='determinate',
                style='Mood.TProgressbar'
            )
            progress.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
            
            self.confidence_bars[mood] = progress

        # Right panel: Playlist and Controls
        self.right_panel = ttk.Frame(
            self.main_container,
            style='Modern.TFrame'
        )
        self.right_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        # Current song info
        self.song_info_frame = ttk.Frame(
            self.right_panel,
            style='Modern.TFrame'
        )
        self.song_info_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.song_title = ttk.Label(
            self.song_info_frame,
            text="No song playing",
            font=('Segoe UI', 18),
            style='Modern.TLabel'
        )
        self.song_title.pack()

        # Playlist with modern styling
        self.playlist_frame = ttk.Frame(
            self.right_panel,
            style='Modern.TFrame'
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

        # Modern control buttons with icons
        self.controls_frame = ttk.Frame(
            self.right_panel,
            style='Modern.TFrame'
        )
        self.controls_frame.pack(fill=tk.X, pady=20)

        self.play_button = ModernButton(
            self.controls_frame,
            'assets/play.svg',
            command=self.toggle_playback
        )
        self.play_button.pack(side=tk.LEFT, padx=5)

        self.next_button = ModernButton(
            self.controls_frame,
            'assets/next.svg',
            command=self.play_next
        )
        self.next_button.pack(side=tk.LEFT, padx=5)

        self.add_button = ModernButton(
            self.controls_frame,
            'assets/add.svg',
            command=self.add_music
        )
        self.add_button.pack(side=tk.LEFT, padx=5)

        # Progress bar with modern styling
        self.progress_frame = ttk.Frame(
            self.right_panel,
            style='Modern.TFrame'
        )
        self.progress_frame.pack(fill=tk.X)
        
        self.progress_bar = ttk.Progressbar(
            self.progress_frame,
            length=400,
            mode='determinate',
            style='Mood.TProgressbar'
        )
        self.progress_bar.pack(fill=tk.X, pady=(0, 5))
        
        self.time_label = ttk.Label(
            self.progress_frame,
            text="0:00 / 0:00",
            font=('Segoe UI', 10),
            style='Modern.TLabel'
        )
        self.time_label.pack()

        # Volume control with modern styling
        self.volume_frame = ttk.Frame(
            self.right_panel,
            style='Modern.TFrame'
        )
        self.volume_frame.pack(fill=tk.X, pady=(20, 0))
        
        self.volume_icon = ModernButton(
            self.volume_frame,
            'assets/volume.svg',
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

    def setup_camera(self):
        self.cap = cv2.VideoCapture(0)
        self.emotion_model = self.load_emotion_model()

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
                ret, frame = self.cap.read()
                if ret:
                    # Convert frame to RGB for display
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    # Resize for display
                    height, width = rgb_frame.shape[:2]
                    max_height = 300
                    if height > max_height:
                        ratio = max_height / height
                        new_width = int(width * ratio)
                        rgb_frame = cv2.resize(rgb_frame, (new_width, max_height))
                    
                    # Convert to PhotoImage
                    img = Image.fromarray(rgb_frame)
                    photo = ImageTk.PhotoImage(image=img)
                    
                    # Update camera feed
                    self.camera_label.configure(image=photo)
                    self.camera_label.image = photo
                    
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

    def toggle_playback(self):
        if self.is_playing:
            pygame.mixer.music.pause()
            self.play_button.load_icon('assets/play.svg')
        else:
            if not pygame.mixer.music.get_busy():
                self.play_next()
            else:
                pygame.mixer.music.unpause()
            self.play_button.load_icon('assets/pause.svg')
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
            self.play_button.load_icon('assets/pause.svg')

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
        self.root.mainloop()

if __name__ == "__main__":
    app = MoodBasedMusicPlayer()
    try:
        app.run()
    finally:
        app.cap.release()
        cv2.destroyAllWindows()