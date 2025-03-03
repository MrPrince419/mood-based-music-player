import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

let detector = null;

async function initDetector() {
    await tf.ready();
    detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector
    );
}

self.onmessage = async function(e) {
    if (!detector) await initDetector();
    
    try {
        const result = await detector.estimateFaces(e.data.imageData);
        self.postMessage({ type: 'result', data: result });
    } catch (error) {
        self.postMessage({ type: 'error', error: error.message });
    }
};