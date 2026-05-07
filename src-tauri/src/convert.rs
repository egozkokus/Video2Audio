use serde::Serialize;
use std::io::{BufRead, BufReader};
use std::os::windows::process::CommandExt;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use tauri::{Emitter, Manager};

use crate::AppState;
use crate::ffmpeg::{classify_ffmpeg_error, parse_duration_secs, probe_audio};
use crate::process::{resume_process, suspend_process, terminate_process_by_pid};

#[derive(Clone, Serialize)]
pub(crate) struct ProgressPayload {
    id: u32,
    percent: f64,
    time: String,
    speed: String,
}

#[derive(Clone, Serialize)]
pub(crate) struct ConvertDonePayload {
    id: u32,
    success: bool,
    message: String,
    output_path: String,
}

#[tauri::command]
pub async fn cancel_conversion(app: tauri::AppHandle) -> Result<String, String> {
    let state = app.state::<AppState>();
    // Set cancellation flag unconditionally so that a cancel arriving during
    // pre-spawn work (e.g. probe_audio) is honored once the spawn check runs.
    *state.cancelled.lock().unwrap() = true;
    *state.paused.lock().unwrap() = false;
    let pid = state.child_pid.lock().unwrap().take();
    if let Some(pid) = pid {
        resume_process(pid);
        terminate_process_by_pid(pid);
        if let Some(path) = state.output_path.lock().unwrap().take() {
            let _ = std::fs::remove_file(&path);
        }
    }
    Ok("cancelled".into())
}

#[tauri::command]
pub async fn pause_conversion(app: tauri::AppHandle) -> Result<bool, String> {
    let state = app.state::<AppState>();
    let pid = *state.child_pid.lock().unwrap();
    if let Some(pid) = pid {
        let mut paused = state.paused.lock().unwrap();
        if *paused {
            resume_process(pid);
            *paused = false;
            Ok(false)
        } else {
            suspend_process(pid);
            *paused = true;
            Ok(true)
        }
    } else {
        Err("No active conversion".into())
    }
}

#[tauri::command]
pub async fn convert_file(
    app: tauri::AppHandle,
    input_path: String,
    output_path: String,
    format: String,
    bitrate: String,
    sample_rate: String,
    max_quality: bool,
    conversion_id: u32,
) -> Result<String, String> {
    let state = app.state::<AppState>();
    let ffmpeg_path = state.ffmpeg_path.clone();

    // Reset cancellation flag for this new conversion. From here on, any
    // cancel_conversion call will set it back to true and we'll honor it.
    *state.cancelled.lock().unwrap() = false;

    let mut args: Vec<String> = vec![
        "-y".into(),
        "-threads".into(),
        "0".into(),
        "-i".into(),
        input_path.clone(),
        "-map".into(),
        "0:a:0".into(),
    ];

    if max_quality {
        let info = probe_audio(&ffmpeg_path, &input_path);
        let src_codec = info.as_ref().map(|i| i.codec.as_str()).unwrap_or("");
        let src_rate = info.as_ref().map(|i| i.sample_rate);
        let src_channels = info.as_ref().map(|i| i.channels);

        match format.as_str() {
            "mp3" => {
                if src_codec == "mp3" {
                    args.extend_from_slice(&["-c:a".into(), "copy".into()]);
                } else {
                    args.extend_from_slice(&[
                        "-codec:a".into(),
                        "libmp3lame".into(),
                        "-q:a".into(),
                        "0".into(),
                    ]);
                    if let Some(rate) = src_rate {
                        args.extend_from_slice(&["-ar".into(), rate.to_string()]);
                    }
                    if let Some(ch) = src_channels {
                        args.extend_from_slice(&["-ac".into(), ch.to_string()]);
                    }
                }
            }
            "wav" => {
                if src_codec.starts_with("pcm_") {
                    args.extend_from_slice(&["-c:a".into(), "copy".into()]);
                } else {
                    args.extend_from_slice(&["-codec:a".into(), "pcm_s16le".into()]);
                    if let Some(rate) = src_rate {
                        args.extend_from_slice(&["-ar".into(), rate.to_string()]);
                    }
                    if let Some(ch) = src_channels {
                        args.extend_from_slice(&["-ac".into(), ch.to_string()]);
                    }
                }
            }
            _ => return Err("Unsupported format".into()),
        }
    } else {
        match format.as_str() {
            "mp3" => {
                args.extend_from_slice(&[
                    "-codec:a".into(),
                    "libmp3lame".into(),
                    "-b:a".into(),
                    bitrate.clone(),
                    "-ar".into(),
                    sample_rate.clone(),
                ]);
            }
            "wav" => {
                args.extend_from_slice(&[
                    "-codec:a".into(),
                    "pcm_s16le".into(),
                    "-ar".into(),
                    sample_rate.clone(),
                ]);
            }
            _ => return Err("Unsupported format".into()),
        }
    }

    // Build temp path
    let out = std::path::Path::new(&output_path);
    let ext = out.extension().and_then(|e| e.to_str()).unwrap_or("");
    let temp_name = format!(
        ".v2a_tmp_{}.{}",
        std::process::id()
            ^ (std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .subsec_nanos() as u32),
        ext
    );
    let temp_path = out
        .parent()
        .unwrap_or(std::path::Path::new("."))
        .join(&temp_name)
        .to_string_lossy()
        .to_string();

    args.extend_from_slice(&["-progress".into(), "pipe:1".into(), temp_path.clone()]);

    // Honor cancellation arriving during pre-spawn work (e.g. probe_audio).
    if *state.cancelled.lock().unwrap() {
        return Err("cancelled".into());
    }

    let mut child = Command::new(&ffmpeg_path)
        .args(&args)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(0x08000000) // CREATE_NO_WINDOW
        .spawn()
        .map_err(|_| "err_launch_failed".to_string())?;

    let pid = child.id();

    // Store state
    *state.child_pid.lock().unwrap() = Some(pid);
    *state.paused.lock().unwrap() = false;
    *state.output_path.lock().unwrap() = Some(temp_path.clone());
    *state.conversion_id.lock().unwrap() = conversion_id;

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();

    let duration: Arc<Mutex<Option<f64>>> = Arc::new(Mutex::new(None));

    // Thread: read stderr for duration info + collect error output
    let stderr_output: Arc<Mutex<String>> = Arc::new(Mutex::new(String::new()));
    let stderr_out_clone = stderr_output.clone();
    let dur_clone = duration.clone();
    let stderr_handle = std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        let mut collected = String::new();
        for line in reader.lines().flatten() {
            if line.contains("Duration:") {
                if let Some(start) = line.find("Duration:") {
                    let after = &line[start + 9..];
                    if let Some(comma) = after.find(',') {
                        let dur_str = after[..comma].trim();
                        if let Some(secs) = parse_duration_secs(dur_str) {
                            *dur_clone.lock().unwrap() = Some(secs);
                        }
                    }
                }
            }
            collected.push_str(&line);
            collected.push('\n');
        }
        *stderr_out_clone.lock().unwrap() = collected;
    });

    // Thread: read stdout for progress, then wait for exit
    let app_clone = app.clone();
    let dur_clone = duration.clone();
    let output_path_clone = output_path.clone();
    let temp_path_clone = temp_path.clone();

    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        let mut current_time: Option<f64> = None;
        let mut current_speed = String::new();
        let mut got_progress_end = false;

        for line in reader.lines().flatten() {
            if line.starts_with("out_time=") {
                let val = line.trim_start_matches("out_time=");
                if let Some(secs) = parse_duration_secs(val) {
                    current_time = Some(secs);
                }
            } else if line.starts_with("speed=") {
                current_speed = line.trim_start_matches("speed=").trim().to_string();
            } else if line.starts_with("progress=") {
                let dur = dur_clone.lock().unwrap().unwrap_or(0.0);
                let percent = if dur > 0.0 {
                    (current_time.unwrap_or(0.0) / dur * 100.0).min(100.0)
                } else {
                    0.0
                };

                let time_str = if let Some(t) = current_time {
                    let h = (t / 3600.0) as u32;
                    let m = ((t % 3600.0) / 60.0) as u32;
                    let s = (t % 60.0) as u32;
                    format!("{:02}:{:02}:{:02}", h, m, s)
                } else {
                    "00:00:00".to_string()
                };

                let _ = app_clone.emit(
                    "conversion-progress",
                    ProgressPayload {
                        id: conversion_id,
                        percent,
                        time: time_str,
                        speed: current_speed.clone(),
                    },
                );

                if line.contains("end") {
                    got_progress_end = true;
                    let state = app_clone.state::<AppState>();
                    *state.child_pid.lock().unwrap() = None;
                    *state.output_path.lock().unwrap() = None;

                    let success =
                        std::fs::rename(&temp_path_clone, &output_path_clone).is_ok();
                    let _ = app_clone.emit(
                        "conversion-done",
                        ConvertDonePayload {
                            id: conversion_id,
                            success,
                            message: if success {
                                "ok".into()
                            } else {
                                "err_save_failed".into()
                            },
                            output_path: if success {
                                output_path_clone.clone()
                            } else {
                                String::new()
                            },
                        },
                    );
                }
            }
        }

        // stdout closed — wait for process exit
        let status = child.wait();
        let _ = stderr_handle.join();

        let state = app_clone.state::<AppState>();
        *state.child_pid.lock().unwrap() = None;
        let current_id = *state.conversion_id.lock().unwrap();
        let was_cancelled =
            *state.cancelled.lock().unwrap() && current_id == conversion_id;

        // If got_progress_end is true we already emitted conversion-done
        // from the stdout loop — don't emit again, even on a late cancel.
        if !got_progress_end {
            if was_cancelled {
                let _ = std::fs::remove_file(&temp_path_clone);
                *state.output_path.lock().unwrap() = None;
                let _ = app_clone.emit(
                    "conversion-done",
                    ConvertDonePayload {
                        id: conversion_id,
                        success: false,
                        message: "cancelled".into(),
                        output_path: String::new(),
                    },
                );
            } else {
                let code = status
                    .map(|s| s.code().unwrap_or(-1))
                    .unwrap_or(-1);
                if code == 0 {
                    *state.output_path.lock().unwrap() = None;
                    let success =
                        std::fs::rename(&temp_path_clone, &output_path_clone).is_ok();
                    let _ = app_clone.emit(
                        "conversion-done",
                        ConvertDonePayload {
                            id: conversion_id,
                            success,
                            message: if success {
                                "ok".into()
                            } else {
                                "err_save_failed".into()
                            },
                            output_path: if success {
                                output_path_clone.clone()
                            } else {
                                String::new()
                            },
                        },
                    );
                } else {
                    let _ = std::fs::remove_file(&temp_path_clone);
                    *state.output_path.lock().unwrap() = None;
                    let stderr_text = stderr_output.lock().unwrap();
                    let error_key = classify_ffmpeg_error(&stderr_text);
                    let _ = app_clone.emit(
                        "conversion-done",
                        ConvertDonePayload {
                            id: conversion_id,
                            success: false,
                            message: error_key.into(),
                            output_path: String::new(),
                        },
                    );
                }
            }
        }
    });

    Ok("started".into())
}
