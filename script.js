// Playlist with all tracks
const playlist = [
    { title: 'Key', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 01 Key.mp3' },
    { title: 'Door', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 02 Door.mp3' },
    { title: 'Subwoofer Lullaby', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 03 Subwoofer Lullaby.mp3' },
    { title: 'Death', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 04 Death.mp3' },
    { title: 'Living Mice', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 05 Living Mice.mp3' },
    { title: 'Moog City', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 06 Moog City.mp3' },
    { title: 'Haggstrom', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 07 Haggstrom.mp3' },
    { title: 'Minecraft', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 08 Minecraft.mp3' },
    { title: 'Oxygène', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 09 Oxygène.mp3' },
    { title: 'Équinoxe', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 10 Équinoxe.mp3' },
    { title: 'Mice on Venus', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 11 Mice on Venus.mp3' },
    { title: 'Dry Hands', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 12 Dry Hands.mp3' },
    { title: 'Wet Hands', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 13 Wet Hands.mp3' },
    { title: 'Clark', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 14 Clark.mp3' },
    { title: 'Chris', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 15 Chris.mp3' },
    { title: 'Thirteen', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 16 Thirteen.mp3' },
    { title: 'Excuse', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 17 Excuse.mp3' },
    { title: 'Sweden', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 18 Sweden.mp3' },
    { title: 'Cat', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 19 Cat.mp3' },
    { title: 'Dog', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 20 Dog.mp3' },
    { title: 'Danny', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 21 Danny.mp3' },
    { title: 'Beginning', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 22 Beginning.mp3' },
    { title: 'Droopy likes ricochet', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 23 Droopy likes ricochet.mp3' },
    { title: 'Droopy likes your face', artist: 'C418', file: 'music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 24 Droopy likes your face.mp3' }
];

// Audio elements
const audioPlayer = document.getElementById('audioPlayer');

// UI Elements
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const songInfoEl = document.getElementById('songInfo');
const songInfoInnerEl = document.getElementById('songInfoInner');
const visualizerEl = document.getElementById('visualizer');
const lcdLabelEl = document.getElementById('lcdLabel');

// State
let currentTrackIndex = 0;
let isPlaying = false;
let audioContext = null;
let analyser = null;
let dataArray = null;
let animationFrameId = null;

// Initialize visualizer bars
const barCount = 12;
for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'visualizer-bar';
    visualizerEl.appendChild(bar);
}

// Format time helper
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Initialize Web Audio API
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Connect audio element to analyser
        const source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }
}

// Update visualizer
function updateVisualizer() {
    if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);

        const bars = visualizerEl.querySelectorAll('.visualizer-bar');
        const numBins = dataArray.length;

        // Equal bands: each bar gets an equal slice of the frequency spectrum.
        // This stops the first bar from being tied to the single hottest (bass) bin
        // and gives the last bars a full band of high frequencies so they move more.
        const binsPerBar = numBins / barCount;

        bars.forEach((bar, index) => {
            const bandStart = Math.floor(index * binsPerBar);
            const bandEnd = Math.floor((index + 1) * binsPerBar);
            let sum = 0;
            let count = 0;
            for (let i = bandStart; i < bandEnd && i < numBins; i++) {
                sum += dataArray[i];
                count++;
            }
            const avgValue = count > 0 ? sum / count : 0;

            // Balance: bass (first bars) is naturally much louder, so we tilt the scale
            // so low-index bars are scaled down and high-index bars scaled up for even movement.
            const normalizedIndex = index / (barCount - 1);
            const tilt = 0.6 + 0.5 * normalizedIndex; // 0.6 for first bar, 1.1 for last
            const adjustedValue = Math.min(255, avgValue * tilt);

            const minHeight = 2;
            const maxHeight = 60;
            const height = Math.max(minHeight, (adjustedValue / 255) * maxHeight);

            bar.style.height = `${height}px`;
        });
    } else {
        // Reset bars when paused
        const bars = visualizerEl.querySelectorAll('.visualizer-bar');
        bars.forEach(bar => {
            const currentHeight = parseInt(bar.style.height) || 2;
            const newHeight = Math.max(2, currentHeight * 0.9);
            bar.style.height = `${newHeight}px`;
        });
    }

    animationFrameId = requestAnimationFrame(updateVisualizer);
}

// Load track
function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];
    audioPlayer.src = track.file;
    songInfoInnerEl.textContent = `${track.title} - ${track.artist}`;
    updateSongInfoScroll();

    audioPlayer.load();
}

function updateSongInfoScroll() {
    if (!songInfoEl || !songInfoInnerEl) return;
    const overflow = songInfoInnerEl.scrollWidth > songInfoEl.clientWidth;
    if (overflow) {
        const scrollEnd = -(songInfoInnerEl.scrollWidth - songInfoEl.clientWidth);
        songInfoEl.style.setProperty('--scroll-end', `${scrollEnd}px`);
        songInfoEl.classList.add('lcd-song-info--scroll');
    } else {
        songInfoEl.style.removeProperty('--scroll-end');
        songInfoEl.classList.remove('lcd-song-info--scroll');
    }
}

// Previous track
function playPrev() {
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1;
    loadTrack(newIndex);
    if (isPlaying) {
        audioPlayer.play().catch(() => {
            isPlaying = false;
            if (typeof updatePlayPauseIcon === 'function') updatePlayPauseIcon();
        });
    }
}

// Next track
function playNext() {
    const newIndex = currentTrackIndex < playlist.length - 1 ? currentTrackIndex + 1 : 0;
    loadTrack(newIndex);
    if (isPlaying) {
        audioPlayer.play().catch(() => {
            isPlaying = false;
            if (typeof updatePlayPauseIcon === 'function') updatePlayPauseIcon();
        });
    }
}

// Play
function playAudio() {
    // If no track is loaded, load the first track
    if (!audioPlayer.src || audioPlayer.src === '') {
        loadTrack(0);
    }
    audioPlayer.play().catch(() => {
        isPlaying = false;
        if (typeof updatePlayPauseIcon === 'function') updatePlayPauseIcon();
    });
}

// Pause
function pauseAudio() {
    audioPlayer.pause();
}

// Seek in track
function seek(event) {
    // Validate that duration is loaded and valid
    if (!audioPlayer.duration || Number.isNaN(audioPlayer.duration) || audioPlayer.duration <= 0) {
        return; // Cannot seek if duration is not available
    }

    const rect = progressContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width)); // Clamp percentage between 0 and 1
    const newTime = percentage * audioPlayer.duration;
    
    // Ensure newTime is within valid bounds
    if (!Number.isNaN(newTime) && newTime >= 0 && newTime <= audioPlayer.duration) {
        audioPlayer.currentTime = newTime;
    }
}

// Update progress bar
function updateProgress() {
    if (audioPlayer.duration) {
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${percentage}%`;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
}

// Volume step and bounds
const VOLUME_STEP = 0.1;
const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

function volumeDown() {
    audioPlayer.volume = Math.max(MIN_VOLUME, audioPlayer.volume - VOLUME_STEP);
}

function volumeUp() {
    audioPlayer.volume = Math.min(MAX_VOLUME, audioPlayer.volume + VOLUME_STEP);
}

// Control buttons (4 separate: Play, Pause, Prev, Next)
const btnPlay = document.getElementById('btnPlay');
const btnPause = document.getElementById('btnPause');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnVolumeDown = document.getElementById('btnVolumeDown');
const btnVolumeUp = document.getElementById('btnVolumeUp');

function updatePlayPauseIcon() {
    if (!btnPlay || !btnPause) return;
    // Both buttons should always be visible
    btnPlay.style.display = 'flex';
    btnPause.style.display = 'flex';
}

function updateLcdLabel() {
    if (!lcdLabelEl) return;
    if (isPlaying) {
        lcdLabelEl.textContent = 'NOW PLAYING';
    } else {
        lcdLabelEl.textContent = 'NOW PLAYING - Paused';
    }
}

if (btnPlay) btnPlay.addEventListener('click', playAudio);
if (btnPause) btnPause.addEventListener('click', pauseAudio);
if (btnPrev) btnPrev.addEventListener('click', playPrev);
if (btnNext) btnNext.addEventListener('click', playNext);
if (btnVolumeDown) btnVolumeDown.addEventListener('click', volumeDown);
if (btnVolumeUp) btnVolumeUp.addEventListener('click', volumeUp);

audioPlayer.addEventListener('play', () => {
    initAudioContext();
    isPlaying = true;
    updatePlayPauseIcon();
    updateLcdLabel();
    if (!animationFrameId) {
        updateVisualizer();
    }
});
audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseIcon();
    updateLcdLabel();
});

// Event Listeners
if (progressContainer) progressContainer.addEventListener('click', seek);

audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
});
audioPlayer.addEventListener('ended', () => {
    // When a track ends, automatically play the next one
    // If it's the last track, loop back to the first but pause
    if (currentTrackIndex < playlist.length - 1) {
        // Not the last track - play next track
        const newIndex = currentTrackIndex + 1;
        loadTrack(newIndex);
        audioPlayer.play().catch(() => {
            isPlaying = false;
            updatePlayPauseIcon();
            updateLcdLabel();
        });
    } else {
        // Last track ended - loop back to first track but keep paused
        loadTrack(0);
        isPlaying = false;
        updatePlayPauseIcon();
        updateLcdLabel();
    }
});

// Initialize
loadTrack(0);
updatePlayPauseIcon();
updateLcdLabel();
// Start visualizer animation loop
updateVisualizer();
