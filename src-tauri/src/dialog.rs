pub(crate) fn warmup_file_dialog() {
    std::thread::spawn(|| unsafe {
        windows_sys::Win32::System::Com::CoInitializeEx(
            std::ptr::null(),
            windows_sys::Win32::System::Com::COINIT_APARTMENTTHREADED as u32,
        );

        let mut dialog: *mut std::ffi::c_void = std::ptr::null_mut();
        let hr = windows_sys::Win32::System::Com::CoCreateInstance(
            &CLSID_FILE_OPEN_DIALOG,
            std::ptr::null_mut(),
            windows_sys::Win32::System::Com::CLSCTX_INPROC_SERVER,
            &IID_IFILE_OPEN_DIALOG,
            &mut dialog,
        );
        if hr == 0 && !dialog.is_null() {
            let vtable = *(dialog as *mut *mut IUnknownVtbl);
            ((*vtable).Release)(dialog);
        }

        windows_sys::Win32::System::Com::CoUninitialize();
    });
}

const CLSID_FILE_OPEN_DIALOG: windows_sys::core::GUID = windows_sys::core::GUID {
    data1: 0xDC1C5A9C,
    data2: 0xE88A,
    data3: 0x4DDE,
    data4: [0xA5, 0xA1, 0x60, 0xF8, 0x2A, 0x20, 0xAE, 0xF7],
};

const IID_IFILE_OPEN_DIALOG: windows_sys::core::GUID = windows_sys::core::GUID {
    data1: 0xD57C7288,
    data2: 0xD4AD,
    data3: 0x4768,
    data4: [0xBE, 0x02, 0x9D, 0x96, 0x95, 0x32, 0xD9, 0x60],
};

#[repr(C)]
#[allow(non_snake_case)]
struct IUnknownVtbl {
    QueryInterface: unsafe extern "system" fn(
        *mut std::ffi::c_void,
        *const windows_sys::core::GUID,
        *mut *mut std::ffi::c_void,
    ) -> i32,
    AddRef: unsafe extern "system" fn(*mut std::ffi::c_void) -> u32,
    Release: unsafe extern "system" fn(*mut std::ffi::c_void) -> u32,
}
