# Video2Audio

A fast, lightweight Windows desktop app for extracting audio from video files. Built with [Tauri 2](https://tauri.app/), Rust, and a vanilla JS frontend, powered by a bundled [FFmpeg](https://ffmpeg.org/) binary.

Supports MP3 and WAV output with configurable bitrate and sample rate. Drag-and-drop, batch conversion, pause/resume, and Hebrew/English UI.

## Features

- Convert `mp4`, `mkv`, `avi`, `mov`, `flv`, `webm`, `wmv` (and more) to MP3 / WAV
- Batch conversion with per-file progress
- Pause, resume, cancel
- Drag-and-drop and file association ("Open with Video2Audio")
- Two distribution modes: NSIS installer and standalone portable `.exe`

## Requirements (development)

- Windows 10 / 11
- [Rust](https://www.rust-lang.org/tools/install) (stable, MSVC toolchain)
- [Tauri CLI](https://tauri.app/start/prerequisites/): `cargo install tauri-cli --version "^2"`
- Windows 10/11 SDK (for `signtool.exe`, used by the build scripts)

## Build

```powershell
# Run the dev build with devtools
npm run dev

# Build the NSIS installer
npm run build:installer

# Build the portable .exe (single-file, no installer)
npm run build:portable
```

Build outputs land under `src-tauri/target/release/` and `src-tauri/target/release/bundle/`.

## Code signing

The app is configured to be signed with a self-signed certificate (`CN=Egoz Kokus`) so that Windows shows a publisher name instead of "Unknown publisher". To set up the certificate on a fresh machine:

```powershell
npm run setup:cert
```

This creates the cert in your `CurrentUser\My` store. Note: a self-signed cert does **not** clear SmartScreen warnings — that requires a paid EV / OV code-signing certificate from a trusted CA.

If you generate your own cert, update `bundle.windows.certificateThumbprint` in `src-tauri/tauri.conf.json` and the `$thumbprint` value in `src-tauri/scripts/sign.ps1`.

## Project layout

```
src/                  Frontend (HTML/CSS/JS)
src-tauri/
  src/                Rust backend
  binaries/           Bundled ffmpeg.exe
  icons/              App icons (multi-format)
  nsis/               NSIS installer customization
  scripts/            PowerShell helpers (signing, cert setup)
  tauri.conf.json     Main Tauri config (installer build)
  tauri.portable.conf.json  Portable build overrides
```

## License

This project is licensed under the [GNU GPL v3.0](LICENSE).

The bundled FFmpeg binary is distributed under its own license (LGPL/GPL — see [ffmpeg.org/legal.html](https://ffmpeg.org/legal.html)). FFmpeg is **not** part of this project's source code; it is shipped as a standalone executable invoked by the app.
