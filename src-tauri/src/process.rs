pub(crate) fn terminate_process_by_pid(pid: u32) {
    unsafe {
        let handle = windows_sys::Win32::System::Threading::OpenProcess(
            0x0001, // PROCESS_TERMINATE
            0,
            pid,
        );
        if !handle.is_null() {
            windows_sys::Win32::System::Threading::TerminateProcess(handle, 1);
            windows_sys::Win32::Foundation::CloseHandle(handle);
        }
    }
}

pub(crate) fn suspend_process(pid: u32) {
    unsafe {
        let handle = windows_sys::Win32::System::Threading::OpenProcess(
            0x0800, // PROCESS_SUSPEND_RESUME
            0,
            pid,
        );
        if !handle.is_null() {
            let ntdll = windows_sys::Win32::System::LibraryLoader::GetModuleHandleA(
                b"ntdll.dll\0".as_ptr(),
            );
            if !ntdll.is_null() {
                let func = windows_sys::Win32::System::LibraryLoader::GetProcAddress(
                    ntdll,
                    b"NtSuspendProcess\0".as_ptr(),
                );
                if let Some(f) = func {
                    let suspend: extern "system" fn(*mut std::ffi::c_void) -> i32 =
                        std::mem::transmute(f);
                    suspend(handle);
                }
            }
            windows_sys::Win32::Foundation::CloseHandle(handle);
        }
    }
}

pub(crate) fn resume_process(pid: u32) {
    unsafe {
        let handle = windows_sys::Win32::System::Threading::OpenProcess(
            0x0800, // PROCESS_SUSPEND_RESUME
            0,
            pid,
        );
        if !handle.is_null() {
            let ntdll = windows_sys::Win32::System::LibraryLoader::GetModuleHandleA(
                b"ntdll.dll\0".as_ptr(),
            );
            if !ntdll.is_null() {
                let func = windows_sys::Win32::System::LibraryLoader::GetProcAddress(
                    ntdll,
                    b"NtResumeProcess\0".as_ptr(),
                );
                if let Some(f) = func {
                    let resume: extern "system" fn(*mut std::ffi::c_void) -> i32 =
                        std::mem::transmute(f);
                    resume(handle);
                }
            }
            windows_sys::Win32::Foundation::CloseHandle(handle);
        }
    }
}
