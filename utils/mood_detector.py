import cv2
import numpy as np
import tensorflow as tf
from typing import Dict, Tuple

class MoodDetector:
    def __init__(self):
        # Emotion labels
        self.emotions = [
            'happy', 'sad', 'energetic',
            'calm', 'focused', 'relaxed'
        ]
        
        # Load pre-trained model
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        # Placeholder for emotion model
        # In production, load a real emotion detection model
        self.emotion_model = None

    def detect_face(self, frame: np.ndarray) -> Tuple[bool, np.ndarray]:
        """
        Detect face in frame and return cropped face.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        if len(faces) == 0:
            return False, None
            
        # Get largest face
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_face
        
        # Crop and preprocess face
        face = frame[y:y+h, x:x+w]
        face = cv2.resize(face, (48, 48))
        face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        face = np.expand_dims(face, axis=-1)
        face = face / 255.0
        
        return True, face

    def detect_emotion(self, frame: np.ndarray) -> Dict[str, float]:
        """
        Detect emotion in frame and return probabilities.
        """
        # Detect face
        face_detected, face = self.detect_face(frame)
        if not face_detected:
            return self.get_default_probabilities()
            
        # In production, use actual model prediction
        # This is a placeholder that returns random probabilities
        probabilities = np.random.random(len(self.emotions))
        probabilities = probabilities / np.sum(probabilities)
        
        return dict(zip(self.emotions, probabilities))

    def get_default_probabilities(self) -> Dict[str, float]:
        """
        Return default probabilities when no face is detected.
        """
        prob = 1.0 / len(self.emotions)
        return {emotion: prob for emotion in self.emotions}

    def draw_face_landmarks(self, frame: np.ndarray) -> np.ndarray:
        """
        Draw face detection landmarks on frame.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        for (x, y, w, h) in faces:
            # Draw rectangle around face
            cv2.rectangle(
                frame,
                (x, y),
                (x+w, y+h),
                (0, 255, 0),
                2
            )
            
            # Add confidence text
            cv2.putText(
                frame,
                'Face Detected',
                (x, y-10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (0, 255, 0),
                2
            )
        
        return frame
