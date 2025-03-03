importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/face-detection');

let detector = null;

async function initializeDetector() {
    await tf.ready();
    detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        { runtime: 'tfjs' }
    );
}

self.onmessage = async function(e) {
    if (!detector) await initializeDetector();
    
    const imageData = e.data;
    try {
        const faces = await detector.estimateFaces(imageData);
        self.postMessage({ faces });
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};