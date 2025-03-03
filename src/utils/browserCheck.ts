export const checkBrowserSupport = () => {
    const requirements = {
        webgl: !!document.createElement('canvas').getContext('webgl'),
        camera: !!navigator.mediaDevices?.getUserMedia,
        webAudio: !!(window.AudioContext || window.webkitAudioContext)
    };

    return {
        supported: Object.values(requirements).every(Boolean),
        requirements
    };
};