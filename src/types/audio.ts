export interface AudioContextType {
    AudioContext: typeof AudioContext;
}

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}
