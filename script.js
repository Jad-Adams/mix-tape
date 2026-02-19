// Playlist (placeholder paths - user will add actual MP3 files)
const playlist = [
    { title: 'The Pot', artist: 'Tool', file: 'music/track1.mp3' },
    { title: 'Song 2', artist: 'Artist 2', file: 'music/track2.mp3' },
    { title: 'Song 3', artist: 'Artist 3', file: 'music/track3.mp3' }
];

// Audio elements
const audioPlayer = document.getElementById('audioPlayer');

// UI Elements
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const songInfoEl = document.getElementById('songInfo');
const visualizerEl = document.getElementById('visualizer');

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
        const step = Math.floor(dataArray.length / barCount);

        bars.forEach((bar, index) => {
            const dataIndex = index * step;
            const value = dataArray[dataIndex];
            const height = Math.max(2, (value / 255) * 60);
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
    songInfoEl.textContent = `${track.title} - ${track.artist}`;
    
    audioPlayer.load();
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

// Control buttons (4 separate: Play, Pause, Prev, Next)
const btnPlay = document.getElementById('btnPlay');
const btnPause = document.getElementById('btnPause');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');

function updatePlayPauseIcon() {
    if (!btnPlay || !btnPause) return;
    if (isPlaying) {
        btnPause.classList.remove('transport-btn-disabled');
        btnPlay.classList.add('transport-btn-disabled');
    } else {
        btnPlay.classList.remove('transport-btn-disabled');
        btnPause.classList.add('transport-btn-disabled');
    }
}

if (btnPlay) btnPlay.addEventListener('click', playAudio);
if (btnPause) btnPause.addEventListener('click', pauseAudio);
if (btnPrev) btnPrev.addEventListener('click', playPrev);
if (btnNext) btnNext.addEventListener('click', playNext);

audioPlayer.addEventListener('play', () => {
    initAudioContext();
    isPlaying = true;
    updatePlayPauseIcon();
    if (!animationFrameId) {
        updateVisualizer();
    }
});
audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseIcon();
});

// Event Listeners
if (progressContainer) progressContainer.addEventListener('click', seek);

audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
});
audioPlayer.addEventListener('ended', () => {
    playNext();
});

// Initialize
loadTrack(0);
updatePlayPauseIcon();
// Start visualizer animation loop
updateVisualizer();
