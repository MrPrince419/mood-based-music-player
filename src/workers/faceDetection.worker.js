import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

let detector = null;

self.onmessage = async (e) => {
  if (e.data.type === 'init') {
    await tf.ready();
    detector = await faceDetection.createDetector(
      faceDetection.SupportedModels.MediaPipeFaceDetector,
      { runtime: 'tfjs' }
    );
    self.postMessage({ type: 'ready' });
  } else if (e.data.type === 'detect') {
    if (!detector) {
      self.postMessage({ type: 'error', error: 'Detector not initialized' });
      return;
    }
    try {
      const faces = await detector.estimateFaces(e.data.imageData);
      self.postMessage({ type: 'result', faces });
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }
};