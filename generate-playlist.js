#!/usr/bin/env node
/**
 * Scans the music/ folder for audio files and writes playlist.json.
 * Run after adding or removing tracks so the app picks them up without code changes.
 *
 * Usage: node generate-playlist.js
 *
 * Supports: .mp3, .m4a, .ogg, .wav
 * Each track gets: file (path), title (from filename), artist "Unknown".
 * You can edit playlist.json afterward to set artist/title per track.
 */

const fs = require("fs");
const path = require("path");

const MUSIC_DIR = path.join(__dirname, "music");
const OUT_FILE = path.join(__dirname, "playlist.json");
const EXTENSIONS = new Set([".mp3", ".m4a", ".ogg", ".wav"]);

function walkDir(dir, baseDir, files = []) {
	if (!fs.existsSync(dir)) return files;
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const e of entries) {
		const full = path.join(dir, e.name);
		if (e.isDirectory()) {
			walkDir(full, baseDir, files);
		} else if (e.isFile() && EXTENSIONS.has(path.extname(e.name).toLowerCase())) {
			const relative = path.relative(baseDir, full);
			files.push(relative.split(path.sep).join("/"));
		}
	}
	return files;
}

function fileToTrack(filePath) {
	const base = path.basename(filePath, path.extname(filePath));
	return {
		title: base,
		artist: "Unknown",
		file: filePath,
	};
}

function main() {
	const filePaths = walkDir(MUSIC_DIR, __dirname).sort();
	const playlist = filePaths.map(fileToTrack);
	fs.writeFileSync(OUT_FILE, JSON.stringify(playlist, null, 2), "utf8");
	console.log(`Wrote ${playlist.length} track(s) to playlist.json`);
}

main();
