from typing import List, Dict
import random
import os

class PlaylistGenerator:
    def __init__(self):
        self.transition_weights = {
            'happy': {
                'happy': 0.6,
                'energetic': 0.2,
                'focused': 0.1,
                'calm': 0.05,
                'relaxed': 0.03,
                'sad': 0.02
            },
            'sad': {
                'sad': 0.5,
                'calm': 0.2,
                'relaxed': 0.15,
                'focused': 0.1,
                'happy': 0.03,
                'energetic': 0.02
            },
            'energetic': {
                'energetic': 0.5,
                'happy': 0.25,
                'focused': 0.15,
                'calm': 0.05,
                'relaxed': 0.03,
                'sad': 0.02
            },
            'calm': {
                'calm': 0.4,
                'relaxed': 0.25,
                'focused': 0.15,
                'happy': 0.1,
                'sad': 0.07,
                'energetic': 0.03
            },
            'focused': {
                'focused': 0.45,
                'calm': 0.2,
                'energetic': 0.15,
                'happy': 0.1,
                'relaxed': 0.07,
                'sad': 0.03
            },
            'relaxed': {
                'relaxed': 0.4,
                'calm': 0.25,
                'focused': 0.15,
                'happy': 0.1,
                'sad': 0.07,
                'energetic': 0.03
            }
        }

    def generate_playlist(
        self,
        songs_by_mood: Dict[str, List[str]],
        current_mood: str,
        playlist_length: int = 10
    ) -> List[str]:
        """
        Generate a mood-appropriate playlist.
        """
        playlist = []
        current_mood_prob = 1.0
        
        while len(playlist) < playlist_length:
            # Select mood based on transition probabilities
            mood_probs = {
                mood: prob * current_mood_prob
                for mood, prob in self.transition_weights[current_mood].items()
            }
            
            # Normalize probabilities
            total = sum(mood_probs.values())
            mood_probs = {
                k: v/total for k, v in mood_probs.items()
            }
            
            # Select next mood
            moods = list(mood_probs.keys())
            probs = list(mood_probs.values())
            selected_mood = random.choices(moods, probs)[0]
            
            # Get available songs for mood
            available_songs = [
                song for song in songs_by_mood[selected_mood]
                if song not in playlist
            ]
            
            if not available_songs:
                continue
                
            # Add random song from mood
            playlist.append(random.choice(available_songs))
            
            # Update current mood probability
            current_mood_prob *= 0.9
        
        return playlist

    def reorder_playlist(
        self,
        playlist: List[str],
        songs_by_mood: Dict[str, List[str]]
    ) -> List[str]:
        """
        Reorder playlist for smooth mood transitions.
        """
        # Get mood for each song
        song_moods = {}
        for song in playlist:
            for mood, songs in songs_by_mood.items():
                if song in songs:
                    song_moods[song] = mood
                    break
        
        # Sort songs by mood transitions
        ordered = [playlist[0]]
        remaining = playlist[1:]
        
        while remaining:
            current_mood = song_moods[ordered[-1]]
            
            # Calculate transition scores
            scores = []
            for song in remaining:
                next_mood = song_moods[song]
                score = self.transition_weights[current_mood][next_mood]
                scores.append((song, score))
            
            # Select song with highest transition score
            next_song = max(scores, key=lambda x: x[1])[0]
            ordered.append(next_song)
            remaining.remove(next_song)
        
        return ordered

    def get_mood_distribution(
        self,
        playlist: List[str],
        songs_by_mood: Dict[str, List[str]]
    ) -> Dict[str, float]:
        """
        Calculate mood distribution in playlist.
        """
        counts = {mood: 0 for mood in self.transition_weights.keys()}
        
        for song in playlist:
            for mood, songs in songs_by_mood.items():
                if song in songs:
                    counts[mood] += 1
                    break
        
        total = sum(counts.values())
        return {
            mood: count/total
            for mood, count in counts.items()
        }
