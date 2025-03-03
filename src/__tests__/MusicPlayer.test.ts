import { MusicPlayer } from '../MusicPlayer';

describe('MusicPlayer', () => {
    let player: MusicPlayer;

    beforeEach(() => {
        player = new MusicPlayer();
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