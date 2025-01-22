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

class MoodBasedMusicPlayer:
    def __init__(self):
        # Initialize main window
        self.root = tk.Tk()
        self.root.title("Mood Based Music Player")
        self.root.geometry("1200x800")
        self.root.configure(bg='#2c3e50')

        # State variables
        self.current_mood = None
        self.is_playing = False
        self.current_song = None
        self.songs_by_mood = {
            'happy': [], 'sad': [], 'energetic': [],
            'calm': [], 'focused': [], 'relaxed': []
        }
        self.mood_colors = {
            'happy': '#f1c40f', 'sad': '#34495e',
            'energetic': '#e74c3c', 'calm': '#3498db',
            'focused': '#2ecc71', 'relaxed': '#9b59b6'
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
        # Create main frames
        self.camera_frame = ttk.Frame(self.root)
        self.camera_frame.pack(side=tk.LEFT, padx=20, pady=20)

        self.control_frame = ttk.Frame(self.root)
        self.control_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=20, pady=20)

        # Camera preview
        self.camera_label = ttk.Label(self.camera_frame)
        self.camera_label.pack()

        # Mood display
        self.mood_frame = ttk.Frame(self.control_frame)
        self.mood_frame.pack(fill=tk.X, pady=10)
        
        self.mood_label = ttk.Label(
            self.mood_frame, 
            text="Detecting mood...", 
            font=('Arial', 24)
        )
        self.mood_label.pack()

        # Confidence bars for each emotion
        self.confidence_bars = {}
        for mood in self.songs_by_mood.keys():
            frame = ttk.Frame(self.mood_frame)
            frame.pack(fill=tk.X, pady=2)
            
            label = ttk.Label(frame, text=mood.capitalize())
            label.pack(side=tk.LEFT, padx=5)
            
            progress = ttk.Progressbar(
                frame, length=200, mode='determinate'
            )
            progress.pack(side=tk.LEFT, padx=5)
            
            self.confidence_bars[mood] = progress

        # Playlist frame
        self.playlist_frame = ttk.Frame(self.control_frame)
        self.playlist_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self.playlist_label = ttk.Label(
            self.playlist_frame, 
            text="Current Playlist", 
            font=('Arial', 16)
        )
        self.playlist_label.pack()
        
        self.playlist = tk.Listbox(
            self.playlist_frame,
            bg='#34495e',
            fg='white',
            selectmode=tk.SINGLE,
            font=('Arial', 12),
            height=10
        )
        self.playlist.pack(fill=tk.BOTH, expand=True)

        # Control buttons
        self.button_frame = ttk.Frame(self.control_frame)
        self.button_frame.pack(fill=tk.X, pady=10)
        
        style = ttk.Style()
        style.configure('Accent.TButton', padding=10)

        self.play_button = ttk.Button(
            self.button_frame,
            text="Play",
            style='Accent.TButton',
            command=self.toggle_playback
        )
        self.play_button.pack(side=tk.LEFT, padx=5)

        self.next_button = ttk.Button(
            self.button_frame,
            text="Next",
            style='Accent.TButton',
            command=self.play_next
        )
        self.next_button.pack(side=tk.LEFT, padx=5)

        self.add_button = ttk.Button(
            self.button_frame,
            text="Add Music",
            style='Accent.TButton',
            command=self.add_music
        )
        self.add_button.pack(side=tk.LEFT, padx=5)

        # Progress bar
        self.progress_frame = ttk.Frame(self.control_frame)
        self.progress_frame.pack(fill=tk.X, pady=10)
        
        self.progress_bar = ttk.Progressbar(
            self.progress_frame,
            length=400,
            mode='determinate'
        )
        self.progress_bar.pack(fill=tk.X)
        
        self.time_label = ttk.Label(
            self.progress_frame,
            text="0:00 / 0:00"
        )
        self.time_label.pack()

        # Volume control
        self.volume_frame = ttk.Frame(self.control_frame)
        self.volume_frame.pack(fill=tk.X, pady=10)
        
        self.volume_label = ttk.Label(
            self.volume_frame,
            text="Volume"
        )
        self.volume_label.pack(side=tk.LEFT, padx=5)
        
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
        # Load emotion detection model (placeholder)
        self.emotion_model = self.load_emotion_model()

    def setup_audio(self):
        pygame.mixer.init()
        self.current_volume = 0.7
        pygame.mixer.music.set_volume(self.current_volume)

    def load_emotion_model(self):
        # Placeholder for emotion model loading
        # In a real implementation, load a pre-trained model
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
                    # Convert frame for display
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    img = Image.fromarray(rgb_frame)
                    img = img.resize((400, 300))
                    img_tk = ImageTk.PhotoImage(image=img)
                    
                    # Update camera feed
                    self.camera_label.configure(image=img_tk)
                    self.camera_label.image = img_tk
                    
                    # Detect emotion (placeholder)
                    self.analyze_mood(frame)
                
                time.sleep(0.03)  # ~30 FPS

        thread = threading.Thread(target=detect_mood, daemon=True)
        thread.start()

    def analyze_mood(self, frame):
        # Placeholder for mood detection
        # In a real implementation, use the emotion model
        moods = {
            'happy': np.random.random(),
            'sad': np.random.random(),
            'energetic': np.random.random(),
            'calm': np.random.random(),
            'focused': np.random.random(),
            'relaxed': np.random.random()
        }
        
        # Normalize probabilities
        total = sum(moods.values())
        moods = {k: v/total for k, v in moods.items()}
        
        # Update confidence bars
        for mood, confidence in moods.items():
            self.confidence_bars[mood]['value'] = confidence * 100
        
        # Update current mood
        current_mood = max(moods.items(), key=lambda x: x[1])[0]
        if current_mood != self.current_mood:
            self.current_mood = current_mood
            self.update_playlist()

    def update_playlist(self):
        if not self.current_mood:
            return
            
        # Clear current playlist
        self.playlist.delete(0, tk.END)
        
        # Add songs for current mood
        for song in self.songs_by_mood[self.current_mood]:
            self.playlist.insert(tk.END, os.path.basename(song))
        
        # Update mood display
        self.mood_label.configure(
            text=f"Current Mood: {self.current_mood.capitalize()}",
            foreground=self.mood_colors[self.current_mood]
        )

    def toggle_playback(self):
        if not self.is_playing and self.playlist.size() > 0:
            if not self.current_song:
                self.play_selected_song()
            else:
                pygame.mixer.music.unpause()
                self.is_playing = True
                self.play_button.configure(text="Pause")
        elif self.is_playing:
            pygame.mixer.music.pause()
            self.is_playing = False
            self.play_button.configure(text="Play")

    def play_selected_song(self):
        selection = self.playlist.curselection()
        if not selection:
            self.playlist.selection_set(0)
            selection = (0,)
            
        song_name = self.playlist.get(selection[0])
        song_path = next(
            song for song in self.songs_by_mood[self.current_mood]
            if os.path.basename(song) == song_name
        )
        
        pygame.mixer.music.load(song_path)
        pygame.mixer.music.play()
        self.is_playing = True
        self.current_song = song_path
        self.play_button.configure(text="Pause")

    def play_next(self):
        if not self.playlist.size():
            return
            
        current = self.playlist.curselection()
        next_index = 0 if not current else (current[0] + 1) % self.playlist.size()
        
        self.playlist.selection_clear(0, tk.END)
        self.playlist.selection_set(next_index)
        self.play_selected_song()

    def add_music(self):
        files = filedialog.askopenfilenames(
            title="Select Music Files",
            filetypes=[
                ("Audio Files", "*.mp3 *.wav *.ogg")
            ]
        )
        
        if not files:
            return
            
        # Ask for mood classification
        mood_window = tk.Toplevel(self.root)
        mood_window.title("Select Mood")
        mood_window.geometry("300x200")
        
        mood_var = tk.StringVar(value='happy')
        
        for mood in self.songs_by_mood.keys():
            tk.Radiobutton(
                mood_window,
                text=mood.capitalize(),
                value=mood,
                variable=mood_var
            ).pack(pady=5)
            
        def save_songs():
            selected_mood = mood_var.get()
            self.songs_by_mood[selected_mood].extend(files)
            self.save_music_library()
            self.update_playlist()
            mood_window.destroy()
            
        ttk.Button(
            mood_window,
            text="Save",
            command=save_songs
        ).pack(pady=10)

    def update_volume(self, value):
        self.current_volume = float(value) / 100
        pygame.mixer.music.set_volume(self.current_volume)

    def update_ui(self):
        if self.is_playing:
            # Update progress bar
            current_pos = pygame.mixer.music.get_pos() / 1000  # Convert to seconds
            if self.current_song:
                duration = librosa.get_duration(filename=self.current_song)
                progress = (current_pos / duration) * 100
                self.progress_bar['value'] = progress
                
                # Update time label
                current_time = time.strftime('%M:%S', time.gmtime(current_pos))
                total_time = time.strftime('%M:%S', time.gmtime(duration))
                self.time_label['text'] = f"{current_time} / {total_time}"
                
                # Check if song ended
                if not pygame.mixer.music.get_busy():
                    self.play_next()
        
        self.root.after(100, self.update_ui)

    def run(self):
        self.root.mainloop()

    def cleanup(self):
        self.cap.release()
        pygame.mixer.quit()

if __name__ == "__main__":
    app = MoodBasedMusicPlayer()
    try:
        app.run()
    finally:
        app.cleanup()