; Custom NSIS installer hooks for Video2Audio

!macro NSIS_HOOK_PREFINISH
  ; Hide the empty "Show ReadMe" checkbox
  ShowWindow $mui.FinishPage.ShowReadme 0
!macroend

!macro CUSTOM_INSTALL_CLEANUP
  ; Clean up old temp-based ffmpeg if it exists (migration from older versions)
  RMDir /r "$TEMP\video2audio"
  RMDir /r "$APPDATA\Video2Audio"
!macroend

; ---- Context menu: "Convert to MP3" for supported file types ----

!macro _RegisterContextMenu EXT
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.${EXT}\shell\V2A_ConvertMP3" "" "Convert to MP3"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.${EXT}\shell\V2A_ConvertMP3" "Icon" "$INSTDIR\Video2Audio.exe"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.${EXT}\shell\V2A_ConvertMP3\command" "" '"$INSTDIR\Video2Audio.exe" --convert "%1"'
!macroend

!macro _UnregisterContextMenu EXT
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.${EXT}\shell\V2A_ConvertMP3"
!macroend

!macro _RegisterAllContextMenus
  !insertmacro _RegisterContextMenu "mp4"
  !insertmacro _RegisterContextMenu "mkv"
  !insertmacro _RegisterContextMenu "avi"
  !insertmacro _RegisterContextMenu "mov"
  !insertmacro _RegisterContextMenu "flv"
  !insertmacro _RegisterContextMenu "ts"
  !insertmacro _RegisterContextMenu "webm"
  !insertmacro _RegisterContextMenu "wmv"
  !insertmacro _RegisterContextMenu "ogg"
  !insertmacro _RegisterContextMenu "flac"
  !insertmacro _RegisterContextMenu "m4a"
  !insertmacro _RegisterContextMenu "wma"
  !insertmacro _RegisterContextMenu "wav"
  !insertmacro _RegisterContextMenu "aac"
  !insertmacro _RegisterContextMenu "mp3"
!macroend

!macro _UnregisterAllContextMenus
  !insertmacro _UnregisterContextMenu "mp4"
  !insertmacro _UnregisterContextMenu "mkv"
  !insertmacro _UnregisterContextMenu "avi"
  !insertmacro _UnregisterContextMenu "mov"
  !insertmacro _UnregisterContextMenu "flv"
  !insertmacro _UnregisterContextMenu "ts"
  !insertmacro _UnregisterContextMenu "webm"
  !insertmacro _UnregisterContextMenu "wmv"
  !insertmacro _UnregisterContextMenu "ogg"
  !insertmacro _UnregisterContextMenu "flac"
  !insertmacro _UnregisterContextMenu "m4a"
  !insertmacro _UnregisterContextMenu "wma"
  !insertmacro _UnregisterContextMenu "wav"
  !insertmacro _UnregisterContextMenu "aac"
  !insertmacro _UnregisterContextMenu "mp3"
!macroend

; ---- Hooks ----

!macro customInstall
  !insertmacro CUSTOM_INSTALL_CLEANUP
  !insertmacro _RegisterAllContextMenus
!macroend

!macro customUninstall
  !insertmacro _UnregisterAllContextMenus
!macroend
