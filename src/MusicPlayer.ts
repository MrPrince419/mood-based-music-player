import { Song, PlayerState } from './types/music';

export class MusicPlayer {
    private audio: HTMLAudioElement;
    private _isPlaying: boolean = false;
    private _currentSongIndex: number = 0;
    private _songs: Map<string, Song> = new Map();

    constructor() {
        this.audio = new Audio();
        this.setupAudioListeners();
    }

    get isPlaying(): boolean {
        return this._isPlaying;
    }

    get currentSongIndex(): number {
        return this._currentSongIndex;
    }

    get songs(): Map<string, Song> {
        return this._songs;
    }

    private setupAudioListeners(): void {
        this.audio.addEventListener('ended', () => {
            this._isPlaying = false;
        });
    }

    public playSong(song: Song): void {
        this.audio.src = song.url;
        this.audio.play();
        this._isPlaying = true;
    }

    public pause(): void {
        this.audio.pause();
        this._isPlaying = false;
    }

    public cleanup(): void {
        this.audio.pause();
        this.audio.src = '';
    }
}
