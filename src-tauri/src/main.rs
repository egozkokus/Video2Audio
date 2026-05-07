// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod convert;
mod dialog;
mod ffmpeg;
mod media;
mod process;

use std::path::PathBuf;
use std::sync::atomic::AtomicBool;
use std::sync::{Arc, Mutex};
use tauri::Manager;

pub(crate) struct AppState {
    pub(crate) child_pid: Mutex<Option<u32>>,
    pub(crate) paused: Mutex<bool>,
    pub(crate) cancelled: Mutex<bool>,
    pub(crate) output_path: Mutex<Option<String>>,
    pub(crate) conversion_id: Mutex<u32>,
    pub(crate) ffmpeg_path: PathBuf,
    pub(crate) scan_cancelled: Arc<AtomicBool>,
}

#[tauri::command]
fn build_output_path(folder: String, name: String, extension: String) -> String {
    let mut path = PathBuf::from(folder);
    path.push(format!("{}.{}", name, extension));
    path.to_string_lossy().to_string()
}

/// Open a file's parent folder in Explorer with the file highlighted.
/// If the path is a folder (or the file vanished), opens the folder itself.
#[tauri::command]
fn open_in_explorer(path: String) {
    use std::os::windows::process::CommandExt;
    let p = std::path::Path::new(&path);
    let arg = if p.is_file() {
        format!("/select,{}", path)
    } else {
        path.clone()
    };
    let _ = std::process::Command::new("explorer.exe")
        .arg(arg)
        .creation_flags(0x08000000)
        .spawn();
}

/// Build an output path next to each input file, auto-renaming on collision
/// against both on-disk files and other paths in this same batch.
#[tauri::command]
fn build_source_output_paths(input_paths: Vec<String>, extension: String) -> Vec<String> {
    use std::collections::HashSet;
    let mut outputs = Vec::with_capacity(input_paths.len());
    // Track in-batch claims case-insensitively (Windows filesystem semantics).
    let mut claimed: HashSet<String> = HashSet::new();

    for input_path in input_paths {
        let input = std::path::Path::new(&input_path);
        let parent = input.parent().unwrap_or(std::path::Path::new("."));
        let stem = input
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("output");

        let mut candidate = parent.join(format!("{}.{}", stem, extension));
        let mut counter: u32 = 2;
        loop {
            let candidate_str = candidate.to_string_lossy().to_string();
            let candidate_lower = candidate_str.to_lowercase();
            if !candidate.exists() && !claimed.contains(&candidate_lower) {
                claimed.insert(candidate_lower);
                outputs.push(candidate_str);
                break;
            }
            candidate = parent.join(format!("{} ({}).{}", stem, counter, extension));
            counter += 1;
            if counter > 9999 {
                let s = candidate.to_string_lossy().to_string();
                claimed.insert(s.to_lowercase());
                outputs.push(s);
                break;
            }
        }
    }

    outputs
}

fn cleanup_on_exit(app: &tauri::AppHandle) {
    let state = app.state::<AppState>();
    let pid = state.child_pid.lock().unwrap().take();
    if let Some(pid) = pid {
        process::resume_process(pid);
        process::terminate_process_by_pid(pid);
    }
    let temp = state.output_path.lock().unwrap().take();
    if let Some(path) = temp {
        let _ = std::fs::remove_file(&path);
    }
    #[cfg(feature = "portable")]
    {
        let ffmpeg_temp = std::env::temp_dir().join("video2audio");
        let _ = std::fs::remove_dir_all(&ffmpeg_temp);
    }
}

/// Headless conversion triggered by Windows context menu (installer only).
/// Launched as: Video2Audio.exe --convert "C:\path\to\file.mkv"
/// Converts to MP3 192kbps / 44100Hz in the same folder, then exits.
#[cfg(not(feature = "portable"))]
fn try_context_menu_convert() -> bool {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 3 || args[1] != "--convert" {
        return false;
    }

    let input = PathBuf::from(&args[2]);
    if !input.is_file() {
        return true;
    }

    let parent = input.parent().unwrap_or(std::path::Path::new("."));
    let stem = input.file_stem().unwrap_or_default().to_string_lossy();

    // Avoid overwriting the source when it is already .mp3
    let output = if input.extension().map(|e| e.to_ascii_lowercase()) == Some(std::ffi::OsString::from("mp3")) {
        parent.join(format!("{} (192kbps).mp3", stem))
    } else {
        parent.join(format!("{}.mp3", stem))
    };

    let ffmpeg_path = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.join("ffmpeg.exe")))
        .unwrap_or_else(|| PathBuf::from("ffmpeg.exe"));

    use std::os::windows::process::CommandExt;
    let _ = std::process::Command::new(&ffmpeg_path)
        .args([
            "-y", "-threads", "0",
            "-i", &input.to_string_lossy(),
            "-map", "0:a:0",
            "-codec:a", "libmp3lame",
            "-b:a", "192k",
            "-ar", "44100",
            &output.to_string_lossy(),
        ])
        .creation_flags(0x08000000)
        .status();

    true
}

fn main() {
    #[cfg(not(feature = "portable"))]
    if try_context_menu_convert() {
        return;
    }

    #[cfg(feature = "portable")]
    let ffmpeg_path = ffmpeg::extract_ffmpeg_to_temp().expect("Fatal: failed to extract ffmpeg");

    dialog::warmup_file_dialog();

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init());

    #[cfg(feature = "portable")]
    let builder = builder.manage(AppState {
        child_pid: Mutex::new(None),
        paused: Mutex::new(false),
        cancelled: Mutex::new(false),
        output_path: Mutex::new(None),
        conversion_id: Mutex::new(0),
        ffmpeg_path,
        scan_cancelled: Arc::new(AtomicBool::new(false)),
    });

    #[cfg(not(feature = "portable"))]
    let builder = builder.setup(|app| {
        let ffmpeg_path = app.path()
            .resolve("ffmpeg.exe", tauri::path::BaseDirectory::Resource)
            .expect("Fatal: failed to resolve ffmpeg resource path");

        app.manage(AppState {
            child_pid: Mutex::new(None),
            paused: Mutex::new(false),
            cancelled: Mutex::new(false),
            output_path: Mutex::new(None),
            conversion_id: Mutex::new(0),
            ffmpeg_path,
            scan_cancelled: Arc::new(AtomicBool::new(false)),
        });
        Ok(())
    });

    builder
        .invoke_handler(tauri::generate_handler![
            convert::convert_file,
            convert::cancel_conversion,
            convert::pause_conversion,
            media::validate_media_files,
            media::scan_folder,
            media::cancel_scan,
            build_output_path,
            build_source_output_paths,
            open_in_explorer
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| match event {
            tauri::RunEvent::ExitRequested { .. } => {
                cleanup_on_exit(app);
            }
            tauri::RunEvent::WindowEvent {
                event: tauri::WindowEvent::CloseRequested { .. },
                ..
            } => {
                cleanup_on_exit(app);
            }
            _ => {}
        });
}
