import { MusicPlayer } from '../MusicPlayer';
import { Song, PlayerState } from '../types/music';

describe('MusicPlayer', () => {
    let player: MusicPlayer;
    let mockPlayerState: PlayerState;

    beforeEach(() => {
        player = new MusicPlayer();
        mockPlayerState = {
            currentSong: null,
            isPlaying: false,
            volume: 1,
            currentTime: 0,
            duration: 0
        };
    });

    afterEach(() => {
        player.cleanup();
    });

    test('should initialize with correct default values', () => {
        expect(player.isPlaying).toBeFalsy();
        expect(player.currentSongIndex).toBe(0);
        expect(player.songs.size).toBe(0);
    });

    test('should handle song playback correctly', () => {
        const mockSong = { name: 'test.mp3', url: 'blob:test' };
        player.playSong(mockSong);
        expect(player.isPlaying).toBeTruthy();
    });
});