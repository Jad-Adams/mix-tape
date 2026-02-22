// Playlist with all tracks
const playlist = [
	{
		title: "Key",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 01 Key.mp3",
	},
	{
		title: "Door",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 02 Door.mp3",
	},
	{
		title: "Subwoofer Lullaby",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 03 Subwoofer Lullaby.mp3",
	},
	{
		title: "Death",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 04 Death.mp3",
	},
	{
		title: "Living Mice",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 05 Living Mice.mp3",
	},
	{
		title: "Moog City",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 06 Moog City.mp3",
	},
	{
		title: "Haggstrom",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 07 Haggstrom.mp3",
	},
	{
		title: "Minecraft",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 08 Minecraft.mp3",
	},
	{
		title: "Oxygène",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 09 Oxygène.mp3",
	},
	{
		title: "Équinoxe",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 10 Équinoxe.mp3",
	},
	{
		title: "Mice on Venus",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 11 Mice on Venus.mp3",
	},
	{
		title: "Dry Hands",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 12 Dry Hands.mp3",
	},
	{
		title: "Wet Hands",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 13 Wet Hands.mp3",
	},
	{
		title: "Clark",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 14 Clark.mp3",
	},
	{
		title: "Chris",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 15 Chris.mp3",
	},
	{
		title: "Thirteen",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 16 Thirteen.mp3",
	},
	{
		title: "Excuse",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 17 Excuse.mp3",
	},
	{
		title: "Sweden",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 18 Sweden.mp3",
	},
	{
		title: "Cat",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 19 Cat.mp3",
	},
	{
		title: "Dog",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 20 Dog.mp3",
	},
	{
		title: "Danny",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 21 Danny.mp3",
	},
	{
		title: "Beginning",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 22 Beginning.mp3",
	},
	{
		title: "Droopy likes ricochet",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 23 Droopy likes ricochet.mp3",
	},
	{
		title: "Droopy likes your face",
		artist: "C418",
		file: "music/C418 - Minecraft - Volume Alpha/C418 - Minecraft - Volume Alpha - 24 Droopy likes your face.mp3",
	},
];

// Audio elements
const audioPlayer = document.getElementById("audioPlayer");
const clickSound = new Audio("assets/button-click.mp3");

// UI Elements
const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const songInfoEl = document.getElementById("songInfo");
const songInfoInnerEl = document.getElementById("songInfoInner");
const visualizerEl = document.getElementById("visualizer");
const lcdLabelEl = document.getElementById("lcdLabel");

// State
let currentTrackIndex = 0;
let isPlaying = false;
let userHasPaused = false; // true only when user clicked pause (so LCD shows "Paused" not "Ready")
let audioContext = null;
let analyser = null;
let dataArray = null;
let animationFrameId = null;

// Initialize visualizer bars
const barCount = 12;
const barSmoothedValues = new Array(barCount).fill(0);
const visualizerSmoothing = 0.25;
const visualizerMinHeight = 2;
const visualizerMaxHeight = 50;
for (let i = 0; i < barCount; i++) {
	const bar = document.createElement("div");
	bar.className = "visualizer-bar";
	visualizerEl.appendChild(bar);
}

// Format time helper
function formatTime(seconds) {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

		const bars = visualizerEl.querySelectorAll(".visualizer-bar");
		const numBins = dataArray.length;
		const fftSize = analyser.fftSize;
		const sampleRate = audioContext.sampleRate;
		const minFreq = 20;
		const maxFreq = sampleRate / 2;
		const logMin = Math.log(minFreq);
		const logMax = Math.log(maxFreq);

		// Logarithmic bands: each bar covers an equal span in log-frequency space
		// so low frequencies (bass) don't dominate the first few bars.
		for (let index = 0; index < barCount; index++) {
			const lowFreq = Math.exp(logMin + (index / barCount) * (logMax - logMin));
			const highFreq = Math.exp(
				logMin + ((index + 1) / barCount) * (logMax - logMin),
			);
			const bandStart = Math.min(
				numBins - 1,
				Math.max(0, Math.floor((lowFreq * fftSize) / sampleRate)),
			);
			const bandEnd = Math.min(
				numBins,
				Math.max(bandStart + 1, Math.ceil((highFreq * fftSize) / sampleRate)),
			);

			let sum = 0;
			let count = 0;
			for (let i = bandStart; i < bandEnd && i < numBins; i++) {
				sum += dataArray[i];
				count++;
			}
			const avgValue = count > 0 ? sum / count : 0;
			const rawValue = Math.min(255, avgValue);

			// Exponential smoothing so bars don't jump erratically
			barSmoothedValues[index] =
				visualizerSmoothing * rawValue +
				(1 - visualizerSmoothing) * barSmoothedValues[index];
		}

		// Normalize so the tallest bar reaches near the top
		const maxSmoothed = Math.max(...barSmoothedValues, 1);
		const scale = visualizerMaxHeight / maxSmoothed;

		bars.forEach((bar, index) => {
			const height = Math.max(
				visualizerMinHeight,
				Math.min(visualizerMaxHeight, barSmoothedValues[index] * scale),
			);
			bar.style.height = `${height}px`;
		});
	} else {
		// Ease bars down when paused (smooth decay)
		barSmoothedValues.forEach((v, i) => {
			barSmoothedValues[i] = Math.max(0, v * 0.92);
		});
		const bars = visualizerEl.querySelectorAll(".visualizer-bar");
		bars.forEach((bar, index) => {
			const h = barSmoothedValues[index] * (visualizerMaxHeight / 255);
			bar.style.height = `${Math.max(visualizerMinHeight, h)}px`;
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
		songInfoEl.style.setProperty("--scroll-end", `${scrollEnd}px`);
		songInfoEl.classList.add("lcd-song-info--scroll");
	} else {
		songInfoEl.style.removeProperty("--scroll-end");
		songInfoEl.classList.remove("lcd-song-info--scroll");
	}
}

// Previous track
function playPrev() {
	const newIndex =
		currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1;
	loadTrack(newIndex);
	if (isPlaying) {
		audioPlayer.play().catch(() => {
			isPlaying = false;
			if (typeof updatePlayPauseIcon === "function") updatePlayPauseIcon();
		});
	}
}

// Next track
function playNext() {
	const newIndex =
		currentTrackIndex < playlist.length - 1 ? currentTrackIndex + 1 : 0;
	loadTrack(newIndex);
	if (isPlaying) {
		audioPlayer.play().catch(() => {
			isPlaying = false;
			if (typeof updatePlayPauseIcon === "function") updatePlayPauseIcon();
		});
	}
}

// Play
function playAudio() {
	userHasPaused = false;
	// If no track is loaded, load the first track
	if (!audioPlayer.src || audioPlayer.src === "") {
		loadTrack(0);
	}
	audioPlayer.play().catch(() => {
		isPlaying = false;
		if (typeof updatePlayPauseIcon === "function") updatePlayPauseIcon();
	});
}

// Pause
function pauseAudio() {
	userHasPaused = true;
	audioPlayer.pause();
}

// Stop: pause and reset to first track
function stopAudio() {
	userHasPaused = false;
	audioPlayer.pause();
	loadTrack(0);
	isPlaying = false;
	updatePlayPauseIcon();
	updateLcdLabel();
}

// Seek in track
function seek(event) {
	// Validate that duration is loaded and valid
	if (
		!audioPlayer.duration ||
		Number.isNaN(audioPlayer.duration) ||
		audioPlayer.duration <= 0
	) {
		return; // Cannot seek if duration is not available
	}

	const rect = progressContainer.getBoundingClientRect();
	const clickX = event.clientX - rect.left;
	const percentage = Math.max(0, Math.min(1, clickX / rect.width)); // Clamp percentage between 0 and 1
	const newTime = percentage * audioPlayer.duration;

	// Ensure newTime is within valid bounds
	if (
		!Number.isNaN(newTime) &&
		newTime >= 0 &&
		newTime <= audioPlayer.duration
	) {
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

// Click sound uses main volume, scaled down so it's a bit quieter than the music
const CLICK_VOLUME_SCALE = 0.5;
function playClickSound() {
	if (!clickSound) return;
	clickSound.currentTime = 0;
	clickSound.volume = Math.min(1, audioPlayer.volume * CLICK_VOLUME_SCALE);
	clickSound.play().catch(() => {});
}

// Control buttons (Stop, Play/Pause, Prev, Next)
const btnPlay = document.getElementById("btnPlay");
const btnStop = document.getElementById("btnStop");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnVolumeDown = document.getElementById("btnVolumeDown");
const btnVolumeUp = document.getElementById("btnVolumeUp");

function updatePlayPauseIcon() {
	if (!btnPlay) return;
	const img = btnPlay.querySelector("img");
	if (img)
		img.src = isPlaying ? "assets/icon-pause.svg" : "assets/icon-play.svg";
	btnPlay.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
}

function updateLcdLabel() {
	if (!lcdLabelEl) return;
	if (isPlaying) {
		lcdLabelEl.textContent = "NOW PLAYING";
		lcdLabelEl.classList.remove("lcd-label--paused");
	} else {
		lcdLabelEl.textContent = userHasPaused
			? "NOW PLAYING - Paused"
			: "NOW PLAYING - Ready";
		lcdLabelEl.classList.add("lcd-label--paused");
	}
}

function onButtonPointerDown(btn, action) {
	if (!btn) return;
	btn.addEventListener("pointerdown", () => playClickSound());
	btn.addEventListener("click", action);
}
onButtonPointerDown(btnPlay, () => (isPlaying ? pauseAudio() : playAudio()));
onButtonPointerDown(btnStop, stopAudio);
onButtonPointerDown(btnPrev, playPrev);
onButtonPointerDown(btnNext, playNext);
onButtonPointerDown(btnVolumeDown, volumeDown);
onButtonPointerDown(btnVolumeUp, volumeUp);

audioPlayer.addEventListener("play", () => {
	initAudioContext();
	isPlaying = true;
	updatePlayPauseIcon();
	updateLcdLabel();
	if (!animationFrameId) {
		updateVisualizer();
	}
});
audioPlayer.addEventListener("pause", () => {
	isPlaying = false;
	updatePlayPauseIcon();
	updateLcdLabel();
});

// Event Listeners
if (progressContainer) progressContainer.addEventListener("click", seek);

audioPlayer.addEventListener("timeupdate", updateProgress);
audioPlayer.addEventListener("loadedmetadata", () => {
	totalTimeEl.textContent = formatTime(audioPlayer.duration);
});
audioPlayer.addEventListener("ended", () => {
	// When a track ends, automatically play the next one
	// If it's the last track, loop back to the first but pause
	if (currentTrackIndex < playlist.length - 1) {
		// Not the last track - play next track
		const newIndex = currentTrackIndex + 1;
		loadTrack(newIndex);
		audioPlayer.play().catch(() => {
			userHasPaused = false;
			isPlaying = false;
			updatePlayPauseIcon();
			updateLcdLabel();
		});
	} else {
		// Last track ended - loop back to first track but keep paused
		userHasPaused = false;
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
