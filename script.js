// Playlist: loaded from playlist.json so you can add/remove tracks without editing code.
// Each entry: { "title": "...", "artist": "...", "file": "music/.../track.mp3"
// Run node generate-playlist.js to create playlist.json from your music folder
let playlist = [];

// Theme: single source of truth
const THEME_STORAGE_KEY = "mixtape-theme";
let currentTheme =
	document.documentElement.getAttribute("data-theme") || "light";

function getThemeAssetPath(filename) {
	return `assets/themes/${currentTheme}/${filename}`;
}

function refreshThemeImages() {
	document.querySelectorAll("img[data-asset]").forEach((img) => {
		const asset = img.getAttribute("data-asset");
		if (asset) img.src = getThemeAssetPath(asset);
	});
}

function setTheme(theme) {
	if (!["light", "dark", "grey"].includes(theme)) theme = "light";
	currentTheme = theme;
	document.documentElement.setAttribute("data-theme", theme);
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch (_) {}
	refreshThemeImages();
	updatePlayPauseIcon();
}

// Audio elements
const audioPlayer = document.getElementById("audioPlayer");
const clickSound = new Audio("assets/shared/button-click.mp3");

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
		img.src = getThemeAssetPath(isPlaying ? "icon-pause.svg" : "icon-play.svg");
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

// Theme: apply stored or default, then refresh all theme-dependent images
(function applyInitialTheme() {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		if (stored && ["light", "dark", "grey"].includes(stored)) {
			currentTheme = stored;
			document.documentElement.setAttribute("data-theme", stored);
		}
	} catch (_) {
		// localStorage can throw in private browsing (e.g. older Safari); keep default theme
	}
	refreshThemeImages();
})();

// Theme toggle button
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
	themeToggle.addEventListener("click", () => {
		const next = currentTheme === "dark" ? "light" : "dark";
		setTheme(next);
	});
}

// Load playlist from JSON, then initialize player (no code changes needed when you add/remove tracks)
function initPlaylist() {
	fetch("playlist.json")
		.then((res) => {
			if (!res.ok) throw new Error(res.statusText);
			return res.json();
		})
		.then((data) => {
			playlist = Array.isArray(data)
				? data
				: data.tracks || data.playlist || [];
			playlist = playlist.filter(
				(t) => t && typeof t.file === "string" && t.file.trim() !== "",
			);
		})
		.catch(() => {
			playlist = [];
		})
		.finally(() => {
			if (playlist.length > 0) {
				loadTrack(0);
			} else if (songInfoInnerEl) {
				songInfoInnerEl.textContent =
					"No tracks — add playlist.json or run generate-playlist.js";
			}
			updatePlayPauseIcon();
			updateLcdLabel();
			updateVisualizer();
		});
}

initPlaylist();
