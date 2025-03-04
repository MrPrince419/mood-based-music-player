interface BrowserSupport {
  webgl: boolean;
  camera: boolean;
  webAudio: boolean;
  supported: boolean;
}

export const checkBrowserSupport = (): BrowserSupport => {
  const support = {
    webgl: !!document.createElement('canvas').getContext('webgl'),
    camera: !!navigator.mediaDevices?.getUserMedia,
    webAudio: !!(window.AudioContext || window.webkitAudioContext),
    supported: false
  };

  support.supported = Object.values(support).every(Boolean);
  return support;
};