import librosa
import numpy as np
from typing import Dict, Tuple

class AudioProcessor:
    def __init__(self):
        self.mood_features = {
            'happy': {'tempo_range': (120, 180), 'energy_threshold': 0.7},
            'sad': {'tempo_range': (60, 90), 'energy_threshold': 0.4},
            'energetic': {'tempo_range': (140, 200), 'energy_threshold': 0.8},
            'calm': {'tempo_range': (70, 100), 'energy_threshold': 0.3},
            'focused': {'tempo_range': (100, 130), 'energy_threshold': 0.5},
            'relaxed': {'tempo_range': (80, 110), 'energy_threshold': 0.4}
        }

    def analyze_audio(self, file_path: str) -> Dict[str, float]:
        """
        Analyze audio file and return mood probabilities.
        """
        # Load audio file
        y, sr = librosa.load(file_path)
        
        # Extract features
        tempo = self.get_tempo(y, sr)
        energy = self.get_energy(y)
        spectral = self.get_spectral_features(y, sr)
        
        # Calculate mood probabilities
        probabilities = self.calculate_mood_probabilities(
            tempo, energy, spectral
        )
        
        return probabilities

    def get_tempo(self, y: np.ndarray, sr: int) -> float:
        """
        Extract tempo from audio signal.
        """
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)[0]
        return tempo

    def get_energy(self, y: np.ndarray) -> float:
        """
        Calculate energy of the signal.
        """
        return np.mean(librosa.feature.rms(y=y))

    def get_spectral_features(self, y: np.ndarray, sr: int) -> Dict[str, float]:
        """
        Extract spectral features from audio signal.
        """
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        
        return {
            'centroid_mean': np.mean(spectral_centroids),
            'rolloff_mean': np.mean(spectral_rolloff)
        }

    def calculate_mood_probabilities(
        self, 
        tempo: float, 
        energy: float, 
        spectral: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Calculate probability for each mood based on audio features.
        """
        probabilities = {}
        
        for mood, features in self.mood_features.items():
            # Calculate tempo match
            tempo_min, tempo_max = features['tempo_range']
            tempo_match = 1.0 - min(
                abs(tempo - tempo_min) / 60,
                abs(tempo - tempo_max) / 60,
                1.0
            )
            
            # Calculate energy match
            energy_match = 1.0 - min(
                abs(energy - features['energy_threshold']),
                1.0
            )
            
            # Combine features with weights
            probability = (
                0.4 * tempo_match +
                0.4 * energy_match +
                0.2 * (1.0 - abs(energy - features['energy_threshold']))
            )
            
            probabilities[mood] = max(0.0, min(1.0, probability))
        
        # Normalize probabilities
        total = sum(probabilities.values())
        if total > 0:
            probabilities = {
                k: v/total for k, v in probabilities.items()
            }
        
        return probabilities

    def get_audio_duration(self, file_path: str) -> float:
        """
        Get duration of audio file in seconds.
        """
        return librosa.get_duration(filename=file_path)
