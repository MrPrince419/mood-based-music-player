import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let model = null;

self.onmessage = async (e) => {
  if (e.data.type === 'init') {
    await tf.ready();
    model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      { runtime: 'tfjs' }
    );
    self.postMessage({ type: 'ready' });
  } else if (e.data.type === 'detect') {
    if (!model) {
      self.postMessage({ type: 'error', error: 'Model not initialized' });
      return;
    }
    try {
      const predictions = await model.estimateFaces({
        input: e.data.imageData
      });
      const mood = analyzeFacialExpression(predictions[0]);
      self.postMessage({ type: 'result', mood });
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }
};

function analyzeFacialExpression(face) {
  if (!face) return 'neutral';
  
  // Simplified mood detection based on key facial landmarks
  // In a real implementation, you'd want more sophisticated analysis
  const mouthHeight = face.keypoints[13].y - face.keypoints[14].y;
  const eyeDistance = Math.abs(face.keypoints[5].y - face.keypoints[4].y);
  
  if (mouthHeight > 0.2) return 'happy';
  if (eyeDistance < 0.1) return 'sad';
  if (mouthHeight < 0.1) return 'angry';
  return 'neutral';
}