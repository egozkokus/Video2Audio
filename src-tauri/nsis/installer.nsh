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

; The menu opens the normal UI; it does not start a headless conversion.
!macro _RegisterContextMenu EXT
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.${EXT}\shell\V2A_Convert" "" "$R1"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.${EXT}\shell\V2A_Convert" "Icon" '"$INSTDIR\${MAINBINARYNAME}.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.${EXT}\shell\V2A_Convert\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'
!macroend

; Remove only a verb whose command still belongs to this installation.
!macro _UnregisterOwnedContextMenu EXT VERB TAG
  ReadRegStr $R0 HKCU "Software\Classes\SystemFileAssociations\.${EXT}\shell\${VERB}\command" ""
  StrCmp $R0 '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"' v2a_remove_${TAG}_${EXT}_${VERB}
  StrCmp $R0 '"$INSTDIR\${MAINBINARYNAME}.exe" --convert "%1"' 0 v2a_remove_done_${TAG}_${EXT}_${VERB}
v2a_remove_${TAG}_${EXT}_${VERB}:
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.${EXT}\shell\${VERB}"
v2a_remove_done_${TAG}_${EXT}_${VERB}:
!macroend

!macro NSIS_HOOK_POSTINSTALL
  Push $R0
  Push $R1
  StrCpy $R1 "Convert with Video2Audio..."
  StrCmp $LANGUAGE 1037 0 v2a_menu_title_ready
  StrCpy $R1 "המר באמצעות Video2Audio..."
v2a_menu_title_ready:

  !insertmacro _UnregisterOwnedContextMenu "mp4" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "mkv" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "avi" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "mov" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "flv" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "ts" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "webm" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "wmv" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "ogg" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "flac" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "m4a" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "wma" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "wav" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "aac" "V2A_ConvertMP3" "install"
  !insertmacro _UnregisterOwnedContextMenu "mp3" "V2A_ConvertMP3" "install"
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
  Pop $R1
  Pop $R0
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  Push $R0
  !insertmacro _UnregisterOwnedContextMenu "mp4" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "mkv" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "avi" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "mov" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "flv" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "ts" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "webm" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "wmv" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "ogg" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "flac" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "m4a" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "wma" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "wav" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "aac" "V2A_Convert" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "mp4" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "mkv" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "avi" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "mov" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "flv" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "ts" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "webm" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "wmv" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "ogg" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "flac" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "m4a" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "wma" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "wav" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "aac" "V2A_ConvertMP3" "uninstall"
  !insertmacro _UnregisterOwnedContextMenu "mp3" "V2A_ConvertMP3" "uninstall"
  Pop $R0
!macroend
