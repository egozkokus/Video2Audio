; Installer hooks for Video2Audio.
; Stop claiming default video associations. For upgrades, restore a saved
; association only when the old shared ProgID still points to this install.

!macro _RestoreLegacyAssociation EXT
  ReadRegStr $R1 HKCU "Software\Classes\.${EXT}" ""
  StrCmp $R1 "Video File" 0 v2a_restore_done_${EXT}
  ClearErrors
  ReadRegStr $R2 HKCU "Software\Classes\.${EXT}" "Video File_backup"
  IfErrors v2a_restore_done_${EXT}
  ; A repeated old install may have backed up its own ProgID. Do not guess.
  StrCmp $R2 "Video File" v2a_restore_done_${EXT}
  StrCmp $R2 "" v2a_restore_empty_${EXT}
  WriteRegStr HKCU "Software\Classes\.${EXT}" "" "$R2"
  Goto v2a_restore_remove_backup_${EXT}
v2a_restore_empty_${EXT}:
  DeleteRegValue HKCU "Software\Classes\.${EXT}" ""
v2a_restore_remove_backup_${EXT}:
  DeleteRegValue HKCU "Software\Classes\.${EXT}" "Video File_backup"
v2a_restore_done_${EXT}:
!macroend

!macro NSIS_HOOK_PREINSTALL
  Push $R0
  Push $R1
  Push $R2
  ReadRegStr $R0 HKCU "Software\Classes\Video File\shell\open\command" ""
  ; Older Tauri templates did not quote the executable. Accept both forms.
  StrCmp $R0 '$INSTDIR\${MAINBINARYNAME}.exe "%1"' v2a_restore_legacy
  StrCmp $R0 '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"' 0 v2a_restore_legacy_done
v2a_restore_legacy:
  !insertmacro _RestoreLegacyAssociation "mp4"
  !insertmacro _RestoreLegacyAssociation "mkv"
  !insertmacro _RestoreLegacyAssociation "avi"
  !insertmacro _RestoreLegacyAssociation "mov"
  !insertmacro _RestoreLegacyAssociation "flv"
  !insertmacro _RestoreLegacyAssociation "webm"
  !insertmacro _RestoreLegacyAssociation "wmv"
v2a_restore_legacy_done:
  Pop $R2
  Pop $R1
  Pop $R0
!macroend
