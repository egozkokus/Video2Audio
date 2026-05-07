use std::io::Read as IoRead;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::Manager;

use crate::AppState;

const MEDIA_EXTENSIONS: &[&str] = &[
    "mp4", "mkv", "avi", "mov", "flv", "ts", "webm", "ogg", "flac", "m4a", "wma", "wmv", "mp3",
    "wav", "aac",
];

fn check_magic_bytes(path: &str) -> bool {
    let mut file = match std::fs::File::open(path) {
        Ok(f) => f,
        Err(_) => return false,
    };
    let mut buf = [0u8; 197];
    let n = file.read(&mut buf).unwrap_or(0);
    if n < 4 {
        return false;
    }

    if n >= 8 && &buf[4..8] == b"ftyp" {
        return true;
    }
    if buf[0..4] == [0x1A, 0x45, 0xDF, 0xA3] {
        return true;
    }
    if n >= 12 && &buf[0..4] == b"RIFF" && &buf[8..11] == b"AVI" {
        return true;
    }
    if n >= 12 && &buf[0..4] == b"RIFF" && &buf[8..12] == b"WAVE" {
        return true;
    }
    if &buf[0..3] == b"FLV" {
        return true;
    }
    if &buf[0..4] == b"OggS" {
        return true;
    }
    if &buf[0..4] == b"fLaC" {
        return true;
    }
    if &buf[0..3] == b"ID3" {
        return true;
    }
    if buf[0] == 0xFF && buf[1] == 0xFE {
        return false;
    }
    if buf[0] == 0xFE && buf[1] == 0xFF {
        return false;
    }
    if buf[0] == 0xFF && (buf[1] & 0xE0) == 0xE0 {
        return true;
    }
    if buf[0..4] == [0x30, 0x26, 0xB2, 0x75] {
        return true;
    }
    if &buf[0..4] == b".RMF" {
        return true;
    }
    if n >= 188 && buf[0] == 0x47 && buf[188..].first() == Some(&0x47) {
        return true;
    }
    if n >= 196 + 1 && buf[4] == 0x47 && buf[4 + 192] == 0x47 {
        return true;
    }

    false
}

fn has_media_extension(path: &str) -> bool {
    let ext = path.rsplit('.').next().unwrap_or("").to_lowercase();
    MEDIA_EXTENSIONS.contains(&ext.as_str())
}

fn is_media_file(path: &str) -> bool {
    let has_ext = has_media_extension(path);
    let magic = check_magic_bytes(path);

    let ext = path.rsplit('.').next().unwrap_or("").to_lowercase();
    if ext == "ts" {
        return magic;
    }

    magic || has_ext
}

#[tauri::command]
pub async fn validate_media_files(paths: Vec<String>) -> Result<(Vec<String>, usize), String> {
    tokio::task::spawn_blocking(move || {
        let mut valid = Vec::new();
        let mut skipped = 0;
        for path in paths {
            if std::path::Path::new(&path).is_file() && is_media_file(&path) {
                valid.push(path);
            } else {
                skipped += 1;
            }
        }
        (valid, skipped)
    })
    .await
    .map(|(valid, skipped)| (valid, skipped))
    .map_err(|e| format!("Validation task failed: {}", e))
}

#[tauri::command]
pub async fn scan_folder(app: tauri::AppHandle, path: String) -> Result<(Vec<String>, usize), String> {
    let state = app.state::<AppState>();
    state.scan_cancelled.store(false, Ordering::Relaxed);
    let token = state.scan_cancelled.clone();

    tokio::task::spawn_blocking(move || {
        let mut files = Vec::new();
        let mut skipped = 0;
        scan_dir_recursive(std::path::Path::new(&path), &mut files, &mut skipped, &token);
        files.sort();
        (files, skipped)
    })
    .await
    .map(|(files, skipped)| (files, skipped))
    .map_err(|e| format!("Scan task failed: {}", e))
}

#[tauri::command]
pub async fn cancel_scan(app: tauri::AppHandle) {
    let state = app.state::<AppState>();
    state.scan_cancelled.store(true, Ordering::Relaxed);
}

fn scan_dir_recursive(
    dir: &std::path::Path,
    files: &mut Vec<String>,
    skipped: &mut usize,
    cancelled: &AtomicBool,
) {
    if cancelled.load(Ordering::Relaxed) {
        return;
    }
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        if cancelled.load(Ordering::Relaxed) {
            return;
        }
        let path = entry.path();
        if path.is_dir() {
            scan_dir_recursive(&path, files, skipped, cancelled);
        } else if is_media_file(&path.to_string_lossy()) {
            files.push(path.to_string_lossy().to_string());
        } else {
            *skipped += 1;
        }
    }
}
