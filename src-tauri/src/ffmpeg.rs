#[cfg(feature = "portable")]
use std::path::PathBuf;

#[cfg(feature = "portable")]
const FFMPEG_BYTES: &[u8] = include_bytes!("../binaries/ffmpeg-x86_64-pc-windows-msvc.exe");

#[cfg(feature = "portable")]
pub fn extract_ffmpeg_to_temp() -> Result<PathBuf, String> {
    let temp_dir = std::env::temp_dir().join("video2audio");
    std::fs::create_dir_all(&temp_dir)
        .map_err(|e| format!("Failed to create temp dir: {}", e))?;

    let ffmpeg_path = temp_dir.join("ffmpeg.exe");

    // Only write if missing or size differs (avoid rewriting on every launch)
    let needs_write = match std::fs::metadata(&ffmpeg_path) {
        Ok(meta) => meta.len() != FFMPEG_BYTES.len() as u64,
        Err(_) => true,
    };

    if needs_write {
        std::fs::write(&ffmpeg_path, FFMPEG_BYTES)
            .map_err(|e| format!("Failed to extract ffmpeg: {}", e))?;
    }

    Ok(ffmpeg_path)
}

pub(crate) struct AudioInfo {
    pub codec: String,
    pub sample_rate: u32,
    pub channels: u32,
}

pub(crate) fn probe_audio(ffmpeg: &std::path::Path, file: &str) -> Option<AudioInfo> {
    use std::io::Read;
    use std::os::windows::process::CommandExt;
    use std::sync::mpsc;
    use std::time::Duration;

    let mut child = std::process::Command::new(ffmpeg)
        .args(["-hide_banner", "-nostdin", "-i", file])
        .stdin(std::process::Stdio::null())
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::piped())
        .creation_flags(0x08000000)
        .spawn()
        .ok()?;

    let pid = child.id();
    let mut stderr = child.stderr.take()?;

    let (tx, rx) = mpsc::channel();
    std::thread::spawn(move || {
        let mut buf = String::new();
        let _ = stderr.read_to_string(&mut buf);
        let _ = tx.send(buf);
    });

    match rx.recv_timeout(Duration::from_secs(5)) {
        Ok(stderr_text) => {
            let _ = child.wait();
            parse_audio_info(&stderr_text)
        }
        Err(_) => {
            crate::process::terminate_process_by_pid(pid);
            let _ = child.wait();
            None
        }
    }
}

fn parse_audio_info(stderr: &str) -> Option<AudioInfo> {
    let line = stderr.lines().find(|l| l.contains("Audio: "))?;
    let after = line.split("Audio: ").nth(1)?;

    let codec_end = after
        .find(|c: char| c == ' ' || c == ',' || c == '(')
        .unwrap_or(after.len());
    let codec = after[..codec_end].trim().to_lowercase();

    let sample_rate = line
        .split(',')
        .find_map(|p| {
            let p = p.trim();
            p.strip_suffix(" Hz")
                .and_then(|s| s.trim().parse::<u32>().ok())
        })
        .unwrap_or(44100);

    let channels = if line.contains("7.1") {
        8
    } else if line.contains("5.1") {
        6
    } else if line.contains("quad") {
        4
    } else if line.contains("stereo") {
        2
    } else if line.contains("mono") {
        1
    } else {
        2
    };

    Some(AudioInfo {
        codec,
        sample_rate,
        channels,
    })
}

pub(crate) fn parse_duration_secs(s: &str) -> Option<f64> {
    let parts: Vec<&str> = s.trim().split(':').collect();
    if parts.len() == 3 {
        let h: f64 = parts[0].parse().ok()?;
        let m: f64 = parts[1].parse().ok()?;
        let s: f64 = parts[2].parse().ok()?;
        Some(h * 3600.0 + m * 60.0 + s)
    } else {
        None
    }
}

pub(crate) fn classify_ffmpeg_error(stderr: &str) -> &'static str {
    let lower = stderr.to_lowercase();
    if lower.contains("no such file or directory") || lower.contains("does not exist") {
        "err_file_not_found"
    } else if lower.contains("invalid data found") || lower.contains("invalid data") {
        "err_corrupt_file"
    } else if lower.contains("permission denied") {
        "err_permission_denied"
    } else if lower.contains("encoder") && (lower.contains("not found") || lower.contains("unknown")) {
        "err_codec_not_found"
    } else if lower.contains("could not find codec")
        || lower.contains("codec not currently supported")
    {
        "err_codec_not_found"
    } else if lower.contains("no space left") || lower.contains("not enough space") {
        "err_disk_full"
    } else if lower.contains("does not contain any stream")
        || lower.contains("output file is empty")
        || lower.contains("output file #0 does not contain any stream")
        || lower.contains("could not find tag for codec")
    {
        "err_no_audio"
    } else {
        "err_conversion_failed"
    }
}
