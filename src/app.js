const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;
const { open, save } = window.__TAURI__.dialog;

// ============ i18n ============
const i18n = {
  en: {
    subtitle: 'Convert video to MP3 & WAV',
    dropText: 'Drag & drop files or folder here',
    dropHint: 'or click to browse files',
    orBrowseFolder: 'or select a folder',
    pickFiles: 'Browse Files',
    pickFolder: 'Browse Folder',
    addMore: 'Add Files',
    addFolder: 'Add Folder',
    clearAll: 'Clear All',
    confirmClearAll: 'Clear all {n} files?',
    remove: 'Remove',
    format: 'Format',
    bitrate: 'Bitrate',
    sampleRate: 'Sample Rate',
    maxQuality: 'Match source quality',
    maxQualityHint: 'No quality loss — output may be larger',
    saveNextToSource: 'Save next to source',
    customLocationHint: 'You\'ll pick a location each time',
    openFolder: 'Open folder',
    savedTo: 'Saved to {folder}',
    dropToAdd: 'Drop here to add',
    convert: 'Convert',
    converting: 'Converting...',
    paused: 'Paused',
    pause: 'Pause',
    resume: 'Resume',
    cancel: 'Cancel',
    complete: 'Conversion complete!',
    allComplete: 'All conversions complete!',
    cancelled: 'Conversion cancelled',
    langLabel: '\u05E2\u05D1',
    filterName: 'Video/Audio',
    fileCount: '{n} files',
    fileCountSingle: '1 file',
    skippedFiles: '{n} unsupported files skipped',
    noMediaFound: 'No supported files found in folder',
    scanning: 'Scanning folder...',
    convertN: 'Convert {n} files',
    convertingSingle: 'Converting: {name}',
    convertingBatch: 'Converting {current}/{total}: {name}',
    selectOutputFolder: 'Select output folder',
    batchErrors: '{n} files failed',
    batchPartial: '{success} converted, {failed} failed',
    err_file_not_found: 'File not found or cannot be accessed',
    err_corrupt_file: 'The file is corrupted or not a valid media file',
    err_permission_denied: 'Cannot save the file — permission denied',
    err_codec_not_found: 'Required audio codec is not available',
    err_disk_full: 'Not enough disk space',
    err_no_audio: 'No audio track found in this file',
    err_conversion_failed: 'Conversion failed — the file may be unsupported or corrupted',
    err_save_failed: 'Could not save the output file',
    err_launch_failed: 'Could not start the conversion engine',
    err_load_failed: 'Failed to load files — please try again',
  },
  he: {
    subtitle: '\u05D4\u05DE\u05E8\u05EA \u05D5\u05D9\u05D3\u05D0\u05D5 \u05DC-MP3 \u05D5-WAV',
    dropText: '\u05D2\u05E8\u05D5\u05E8 \u05D5\u05E9\u05D7\u05E8\u05E8 \u05E7\u05D1\u05E6\u05D9\u05DD \u05D0\u05D5 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4 \u05DB\u05D0\u05DF',
    dropHint: '\u05D0\u05D5 \u05DC\u05D7\u05E5 \u05DC\u05E2\u05D9\u05D5\u05DF \u05D1\u05E7\u05D1\u05E6\u05D9\u05DD',
    orBrowseFolder: '\u05D0\u05D5 \u05D1\u05D7\u05E8 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4',
    pickFiles: '\u05D1\u05D7\u05E8 \u05E7\u05D1\u05E6\u05D9\u05DD',
    pickFolder: '\u05D1\u05D7\u05E8 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4',
    addMore: '\u05D4\u05D5\u05E1\u05E3 \u05E7\u05D1\u05E6\u05D9\u05DD',
    addFolder: '\u05D4\u05D5\u05E1\u05E3 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4',
    clearAll: '\u05E0\u05E7\u05D4 \u05D4\u05DB\u05DC',
    confirmClearAll: '\u05DC\u05DE\u05D7\u05D5\u05E7 \u05D0\u05EA \u05DB\u05DC {n} \u05D4\u05E7\u05D1\u05E6\u05D9\u05DD?',
    remove: '\u05D4\u05E1\u05E8',
    format: '\u05E4\u05D5\u05E8\u05DE\u05D8',
    bitrate: '\u05E7\u05E6\u05D1 \u05E1\u05D9\u05D1\u05D9\u05D5\u05EA',
    sampleRate: '\u05E7\u05E6\u05D1 \u05D3\u05D2\u05D9\u05DE\u05D4',
    maxQuality: '\u05D4\u05DE\u05E8\u05D4 \u05DC\u05D0\u05D9\u05DB\u05D5\u05EA \u05D4\u05DE\u05E7\u05E1\u05D9\u05DE\u05DC\u05D9\u05EA \u05D4\u05D0\u05E4\u05E9\u05E8\u05D9\u05EA',
    maxQualityHint: '\u05DC\u05DC\u05D0 \u05D0\u05D9\u05D1\u05D5\u05D3 \u05D0\u05D9\u05DB\u05D5\u05EA \u2014 \u05D4\u05E7\u05D5\u05D1\u05E5 \u05E2\u05E9\u05D5\u05D9 \u05DC\u05D4\u05D9\u05D5\u05EA \u05D2\u05D3\u05D5\u05DC \u05D9\u05D5\u05EA\u05E8',
    saveNextToSource: '\u05E9\u05DE\u05D5\u05E8 \u05DC\u05D9\u05D3 \u05D4\u05E7\u05D5\u05D1\u05E5 \u05D4\u05DE\u05E7\u05D5\u05E8\u05D9',
    customLocationHint: '\u05D1\u05DB\u05DC \u05D4\u05DE\u05E8\u05D4 \u05EA\u05D5\u05E4\u05D9\u05E2 \u05E9\u05D0\u05DC\u05D4 \u05DC\u05D1\u05D7\u05D9\u05E8\u05EA \u05DE\u05D9\u05E7\u05D5\u05DD',
    openFolder: '\u05E4\u05EA\u05D7 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4',
    savedTo: '\u05E0\u05E9\u05DE\u05E8 \u05D1-{folder}',
    dropToAdd: '\u05E9\u05D7\u05E8\u05E8 \u05DB\u05D0\u05DF \u05DC\u05D4\u05D5\u05E1\u05E4\u05D4',
    convert: '\u05D4\u05DE\u05E8',
    converting: '\u05DE\u05DE\u05D9\u05E8...',
    paused: '\u05DE\u05D5\u05E9\u05D4\u05D4',
    pause: '\u05D4\u05E9\u05D4\u05D4',
    resume: '\u05D4\u05DE\u05E9\u05DA',
    cancel: '\u05D1\u05D9\u05D8\u05D5\u05DC',
    complete: '!\u05D4\u05D4\u05DE\u05E8\u05D4 \u05D4\u05D5\u05E9\u05DC\u05DE\u05D4',
    allComplete: '!\u05DB\u05DC \u05D4\u05D4\u05DE\u05E8\u05D5\u05EA \u05D4\u05D5\u05E9\u05DC\u05DE\u05D5',
    cancelled: '\u05D4\u05D4\u05DE\u05E8\u05D4 \u05D1\u05D5\u05D8\u05DC\u05D4',
    langLabel: 'EN',
    filterName: '\u05D5\u05D9\u05D3\u05D0\u05D5/\u05D0\u05D5\u05D3\u05D9\u05D5',
    fileCount: '{n} \u05E7\u05D1\u05E6\u05D9\u05DD',
    fileCountSingle: '\u05E7\u05D5\u05D1\u05E5 \u05D0\u05D7\u05D3',
    skippedFiles: '{n} \u05E7\u05D1\u05E6\u05D9\u05DD \u05DC\u05D0 \u05E0\u05EA\u05DE\u05DB\u05D9\u05DD \u05D3\u05D5\u05DC\u05D2\u05D5',
    noMediaFound: '\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05E7\u05D1\u05E6\u05D9\u05DD \u05DE\u05EA\u05D0\u05D9\u05DE\u05D9\u05DD \u05D1\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4',
    scanning: '\u05E1\u05D5\u05E8\u05E7 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4...',
    convertN: '\u05D4\u05DE\u05E8 {n} \u05E7\u05D1\u05E6\u05D9\u05DD',
    convertingSingle: '\u05DE\u05DE\u05D9\u05E8: {name}',
    convertingBatch: '\u05DE\u05DE\u05D9\u05E8 {current}/{total}: {name}',
    selectOutputFolder: '\u05D1\u05D7\u05E8 \u05EA\u05D9\u05E7\u05D9\u05D9\u05EA \u05E4\u05DC\u05D8',
    batchErrors: '{n} \u05E7\u05D1\u05E6\u05D9\u05DD \u05E0\u05DB\u05E9\u05DC\u05D5',
    batchPartial: '{success} \u05D4\u05D5\u05DE\u05E8\u05D5, {failed} \u05E0\u05DB\u05E9\u05DC\u05D5',
    err_file_not_found: '\u05D4\u05E7\u05D5\u05D1\u05E5 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0 \u05D0\u05D5 \u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05D2\u05E9\u05EA \u05D0\u05DC\u05D9\u05D5',
    err_corrupt_file: '\u05D4\u05E7\u05D5\u05D1\u05E5 \u05E4\u05D2\u05D5\u05DD \u05D0\u05D5 \u05E9\u05D0\u05D9\u05E0\u05D5 \u05E7\u05D5\u05D1\u05E5 \u05DE\u05D3\u05D9\u05D4 \u05EA\u05E7\u05D9\u05DF',
    err_permission_denied: '\u05D0\u05D9\u05DF \u05D4\u05E8\u05E9\u05D0\u05D4 \u05DC\u05E9\u05DE\u05D5\u05E8 \u05D0\u05EA \u05D4\u05E7\u05D5\u05D1\u05E5',
    err_codec_not_found: '\u05E7\u05D5\u05D3\u05E7 \u05D4\u05D0\u05D5\u05D3\u05D9\u05D5 \u05D4\u05E0\u05D3\u05E8\u05E9 \u05D0\u05D9\u05E0\u05D5 \u05D6\u05DE\u05D9\u05DF',
    err_disk_full: '\u05D0\u05D9\u05DF \u05DE\u05E1\u05E4\u05D9\u05E7 \u05DE\u05E7\u05D5\u05DD \u05D1\u05D3\u05D9\u05E1\u05E7',
    err_no_audio: '\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0 \u05D0\u05D5\u05D3\u05D9\u05D5 \u05D1\u05E7\u05D5\u05D1\u05E5 \u05D4\u05D6\u05D4',
    err_conversion_failed: '\u05D4\u05D4\u05DE\u05E8\u05D4 \u05E0\u05DB\u05E9\u05DC\u05D4 \u2014 \u05D9\u05D9\u05EA\u05DB\u05DF \u05E9\u05D4\u05E7\u05D5\u05D1\u05E5 \u05DC\u05D0 \u05E0\u05EA\u05DE\u05DA \u05D0\u05D5 \u05E4\u05D2\u05D5\u05DD',
    err_save_failed: '\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05E9\u05DE\u05D5\u05E8 \u05D0\u05EA \u05E7\u05D5\u05D1\u05E5 \u05D4\u05E4\u05DC\u05D8',
    err_launch_failed: '\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05D4\u05E4\u05E2\u05D9\u05DC \u05D0\u05EA \u05DE\u05E0\u05D5\u05E2 \u05D4\u05D4\u05DE\u05E8\u05D4',
    err_load_failed: '\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05E7\u05D1\u05E6\u05D9\u05DD \u2014 \u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1',
  }
};

let currentLang = localStorage.getItem('lang') || 'he';

function t(key, params) {
  let str = i18n[currentLang][key] || i18n.en[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replaceAll('{' + k + '}', v);
    }
  }
  return str;
}

function applyLanguage() {
  const dir = currentLang === 'he' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', currentLang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });

  langLabel.textContent = t('langLabel');
  updateFileCount();
  updateConvertBtnText();

  if (isConverting) {
    updateBatchUI();
    if (isPaused) convertBtn.querySelector('.btn-text').textContent = t('paused');
    pauseText.textContent = isPaused ? t('resume') : t('pause');
  }

  // Re-render done-location since it uses a string template.
  if (lastOutputPath && !doneLocation.classList.contains('hidden')) {
    const folder = lastOutputPath.replace(/[\\/][^\\/]+$/, '');
    doneLocation.textContent = t('savedTo', { folder });
  }
}

// Track running batch state so applyLanguage can repaint mid-batch.
let currentBatchInfo = null;

function updateBatchUI() {
  if (!currentBatchInfo) return;
  const { currentIndex, total, currentName } = currentBatchInfo;
  const isBatch = total > 1;
  if (isBatch) {
    const text = t('convertingBatch', { current: currentIndex + 1, total, name: currentName });
    // batchStatus stays accurate even when paused (file name still relevant);
    // the convert button reflects paused state which overrides the text.
    batchStatus.textContent = text;
    if (!isPaused) convertBtn.querySelector('.btn-text').textContent = text;
  } else if (!isPaused) {
    convertBtn.querySelector('.btn-text').textContent = t('converting');
  }
}

// ============ Elements ============
const dropZone = document.getElementById('drop-zone');
const fileListSection = document.getElementById('file-list-section');
const fileList = document.getElementById('file-list');
const fileCountEl = document.getElementById('file-count');
const skippedNotice = document.getElementById('skipped-notice');
const addMoreBtn = document.getElementById('add-more-btn');
const addFolderBtn = document.getElementById('add-folder-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const btnMp3 = document.getElementById('btn-mp3');
const btnWav = document.getElementById('btn-wav');
const bitrateGroup = document.getElementById('bitrate-group');
const bitrateSelect = document.getElementById('bitrate');
const sampleRate = document.getElementById('sample-rate');
const settingsRow = document.querySelector('.settings');
const maxQualityBtn = document.getElementById('max-quality-btn');
const saveNextBtn = document.getElementById('save-next-btn');
const convertBtn = document.getElementById('convert-btn');
const progressSection = document.getElementById('progress-section');
const batchStatus = document.getElementById('batch-status');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const progressTime = document.getElementById('progress-time');
const progressSpeed = document.getElementById('progress-speed');
const pauseBtn = document.getElementById('pause-btn');
const pauseIcon = document.getElementById('pause-icon');
const resumeIcon = document.getElementById('resume-icon');
const pauseText = document.getElementById('pause-text');
const cancelBtn = document.getElementById('cancel-btn');
const doneSection = document.getElementById('done-section');
const doneIcon = document.getElementById('done-icon');
const doneMessage = document.getElementById('done-message');
const doneLocation = document.getElementById('done-location');
const openFolderBtn = document.getElementById('open-folder-btn');
const dragOverlay = document.getElementById('drag-overlay');
const themeToggle = document.getElementById('theme-toggle');
const themeIconDark = document.getElementById('theme-icon-dark');
const themeIconLight = document.getElementById('theme-icon-light');
const langToggle = document.getElementById('lang-toggle');
const langLabel = document.getElementById('lang-label');

let selectedFiles = [];
let selectedFormat = 'mp3';
let isConverting = false;
let isPaused = false;
let isCancelled = false;
let currentBatchIndex = 0;
let lastOutputPath = null;

// ============ Theme ============
let currentTheme = localStorage.getItem('theme') || 'light';
applyTheme(currentTheme);

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme);
  applyTheme(currentTheme);
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIconDark.classList.toggle('hidden', theme === 'light');
  themeIconLight.classList.toggle('hidden', theme === 'dark');
}

// ============ Language ============
langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'he' : 'en';
  localStorage.setItem('lang', currentLang);
  applyLanguage();
});

applyLanguage();

// ============ Format toggle ============
btnMp3.addEventListener('click', () => setFormat('mp3'));
btnWav.addEventListener('click', () => setFormat('wav'));

function setFormat(fmt) {
  selectedFormat = fmt;
  btnMp3.classList.toggle('active', fmt === 'mp3');
  btnWav.classList.toggle('active', fmt === 'wav');
  bitrateGroup.classList.toggle('hidden', fmt === 'wav');
}

// ============ Max quality toggle ============
let maxQuality = localStorage.getItem('maxQuality') === '1';

function applyMaxQuality() {
  maxQualityBtn.classList.toggle('active', maxQuality);
  settingsRow.classList.toggle('max-quality-on', maxQuality);
  bitrateSelect.disabled = maxQuality;
  sampleRate.disabled = maxQuality;
}

maxQualityBtn.addEventListener('click', () => {
  maxQuality = !maxQuality;
  localStorage.setItem('maxQuality', maxQuality ? '1' : '0');
  applyMaxQuality();
});

applyMaxQuality();

// ============ Save-next-to-source toggle ============
// Default ON (treat missing key as enabled). Toggle OFF to choose location each time.
let saveNextToSource = (localStorage.getItem('saveNextToSource') ?? '1') === '1';

function applySaveNextToSource() {
  saveNextBtn.classList.toggle('active', saveNextToSource);
}

saveNextBtn.addEventListener('click', () => {
  saveNextToSource = !saveNextToSource;
  localStorage.setItem('saveNextToSource', saveNextToSource ? '1' : '0');
  applySaveNextToSource();
});

applySaveNextToSource();

// ============ Helpers ============
function getFileName(path) {
  return path.split('\\').pop().split('/').pop();
}

function getBaseName(name) {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.substring(0, dot) : name;
}

function updateFileCount() {
  const n = selectedFiles.length;
  if (n === 0) return;
  fileCountEl.textContent = n === 1 ? t('fileCountSingle') : t('fileCount', { n });
}

function updateConvertBtnText() {
  if (isConverting) return;
  const n = selectedFiles.length;
  const btnText = convertBtn.querySelector('.btn-text');
  if (n <= 1) {
    btnText.textContent = t('convert');
  } else {
    btnText.textContent = t('convertN', { n });
  }
}

function updateUI() {
  const hasFiles = selectedFiles.length > 0;
  dropZone.classList.toggle('hidden', hasFiles);
  fileListSection.classList.toggle('hidden', !hasFiles);
  convertBtn.disabled = !hasFiles;
  doneSection.classList.add('hidden');
  progressSection.classList.add('hidden');
  updateFileCount();
  updateConvertBtnText();
  renderFileList();
}

function renderFileList() {
  fileList.innerHTML = '';
  selectedFiles.forEach((path, i) => {
    const item = document.createElement('div');
    item.className = 'file-item';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '14 2 14 8 20 8');
    svg.appendChild(path1);
    svg.appendChild(polyline);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'file-item-name';
    nameSpan.textContent = getFileName(path);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-item-remove';
    removeBtn.title = t('remove');
    removeBtn.textContent = '\u2715';
    removeBtn.addEventListener('click', () => {
      if (isConverting) return;
      selectedFiles.splice(i, 1);
      updateUI();
    });

    item.appendChild(svg);
    item.appendChild(nameSpan);
    item.appendChild(removeBtn);
    fileList.appendChild(item);
  });
}

const dropNotice = document.getElementById('drop-notice');
let noticeTimeout = null;

function showNotice(text, type) {
  if (noticeTimeout) {
    clearTimeout(noticeTimeout);
    noticeTimeout = null;
  }

  if (selectedFiles.length === 0) {
    dropNotice.textContent = text;
    dropNotice.className = 'drop-notice' + (type === 'warning' ? ' notice-warn' : '');
    noticeTimeout = setTimeout(() => dropNotice.classList.add('hidden'), 4000);
  } else {
    skippedNotice.textContent = text;
    skippedNotice.className = 'skipped-notice' + (type === 'warning' ? ' notice-warn' : '');
    skippedNotice.classList.remove('hidden');
    noticeTimeout = setTimeout(() => skippedNotice.classList.add('hidden'), 4000);
  }
}

function showSkipped(count) {
  if (count > 0) {
    showNotice(t('skippedFiles', { n: count }), 'warning');
  }
}

function friendlyError(msg) {
  const key = typeof msg === 'string' ? msg.trim() : '';
  if (i18n.en[key]) {
    return t(key);
  }
  return t('err_conversion_failed');
}

// ============ File selection ============
const MEDIA_FILTERS = [{
  name: 'Video/Audio',
  extensions: ['mp4', 'mkv', 'avi', 'mov', 'flv', 'ts', 'webm', 'ogg', 'flac', 'm4a', 'wma', 'wmv', 'mp3', 'wav', 'aac']
}];

async function addFiles() {
  if (isConverting) return;
  try {
    const paths = await open({
      multiple: true,
      filters: MEDIA_FILTERS,
    });
    if (!paths) return;
    const list = Array.isArray(paths) ? paths : [paths];
    const [valid, skipped] = await invoke('validate_media_files', { paths: list });
    addValidFiles(valid);
    showSkipped(skipped);
  } catch (e) {
    console.error('addFiles error:', e);
    showNotice(t('err_load_failed'), 'warning');
  }
}

const dropLoading = document.getElementById('drop-loading');
const fileListLoading = document.getElementById('file-list-loading');
const cancelScanBtn = document.getElementById('cancel-scan-btn');
const cancelScanBtn2 = document.getElementById('cancel-scan-btn-2');
let scanCancelled = false;

function showLoading(show) {
  if (!show) {
    // Always hide both when turning off
    dropLoading.classList.add('hidden');
    fileListLoading.classList.add('hidden');
    return;
  }
  // Show in the correct container depending on whether files are listed
  if (selectedFiles.length > 0) {
    dropLoading.classList.add('hidden');
    fileListLoading.classList.remove('hidden');
  } else {
    fileListLoading.classList.add('hidden');
    dropLoading.classList.remove('hidden');
  }
}

function handleCancelScan(e) {
  e.stopPropagation();
  scanCancelled = true;
  invoke('cancel_scan');
  showLoading(false);
  if (selectedFiles.length === 0) {
    updateUI();
  }
}

cancelScanBtn.addEventListener('click', handleCancelScan);
cancelScanBtn2.addEventListener('click', handleCancelScan);

async function addFolder() {
  if (isConverting) return;
  try {
    const path = await open({ directory: true });
    if (!path) return;
    scanCancelled = false;
    showLoading(true);
    try {
      const [files, skipped] = await invoke('scan_folder', { path });
      if (scanCancelled) return;
      if (files.length === 0) {
        showNotice(t('noMediaFound'), 'warning');
      } else {
        addValidFiles(files);
        showSkipped(skipped);
      }
    } finally {
      showLoading(false);
    }
  } catch (e) {
    console.error('addFolder error:', e);
    showNotice(t('err_load_failed'), 'warning');
  }
}

function addValidFiles(paths) {
  const existing = new Set(selectedFiles);
  for (const p of paths) {
    if (!existing.has(p)) {
      selectedFiles.push(p);
      existing.add(p);
    }
  }
  updateUI();
}

const pickFilesBtn = document.getElementById('pick-files');
const pickFolderBtn = document.getElementById('pick-folder');

pickFilesBtn.addEventListener('click', (e) => { e.stopPropagation(); addFiles(); });
pickFolderBtn.addEventListener('click', (e) => { e.stopPropagation(); addFolder(); });

// Drop zone click opens file picker (clicking the zone itself, not the buttons)
dropZone.addEventListener('click', (e) => {
  if (e.target === dropZone || e.target.closest('.drop-icon') || e.target.closest('.drop-text') || e.target.closest('.drop-hint')) {
    addFiles();
  }
});

addMoreBtn.addEventListener('click', addFiles);
addFolderBtn.addEventListener('click', addFolder);

clearAllBtn.addEventListener('click', () => {
  if (isConverting) return;
  if (selectedFiles.length > 1 && !confirm(t('confirmClearAll', { n: selectedFiles.length }))) return;
  selectedFiles = [];
  updateUI();
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
});

// Window-wide drag overlay so users get visual feedback even when the
// drop-zone is hidden (i.e. the file list is open).
listen('tauri://drag-enter', () => {
  if (isConverting) return;
  dragOverlay.classList.remove('hidden');
});

listen('tauri://drag-leave', () => {
  dragOverlay.classList.add('hidden');
});

listen('tauri://drag-drop', async (event) => {
  dragOverlay.classList.add('hidden');
  if (isConverting) return;
  if (!event.payload || !event.payload.paths || event.payload.paths.length === 0) return;
  const paths = event.payload.paths;

  scanCancelled = false;
  showLoading(true);
  try {
    let allPaths = [];
    let totalSkipped = 0;

    for (const p of paths) {
      if (scanCancelled) return;
      try {
        const [folderFiles, skipped] = await invoke('scan_folder', { path: p });
        if (scanCancelled) return;
        if (folderFiles.length > 0) {
          allPaths.push(...folderFiles);
          totalSkipped += skipped;
          continue;
        }
      } catch (_) { /* not a folder — treat as single file */ }
      allPaths.push(p);
    }

    if (scanCancelled) return;
    const [valid, skipped] = await invoke('validate_media_files', { paths: allPaths });
    if (scanCancelled) return;
    if (valid.length === 0) {
      showNotice(t('noMediaFound'), 'warning');
    } else {
      addValidFiles(valid);
      showSkipped(skipped + totalSkipped);
    }
  } catch (e) {
    console.error('drag-drop error:', e);
    showNotice(t('err_load_failed'), 'warning');
  } finally {
    showLoading(false);
  }
});

// ============ Convert ============
let conversionId = 0;
let isPreparingConvert = false;

convertBtn.addEventListener('click', async () => {
  if (selectedFiles.length === 0 || isConverting || isPreparingConvert) return;

  // Claim immediately so a second click during async prep work
  // (build_source_output_paths / save dialog / open dialog) cannot kick off
  // a second concurrent batch.
  isPreparingConvert = true;
  try {
    // Snapshot settings before any await so the output path, codec params,
    // and conversion stay consistent even if the user toggles controls.
    const config = {
      format: selectedFormat,
      bitrate: bitrateSelect.value,
      sampleRate: sampleRate.value,
      maxQuality,
      saveNextToSource,
    };

    let jobs;
    if (config.saveNextToSource) {
      // Auto path next to each source. Rust handles on-disk + in-batch dedup.
      const outputs = await invoke('build_source_output_paths', {
        inputPaths: selectedFiles,
        extension: config.format,
      });
      jobs = selectedFiles.map((input, i) => ({ input, output: outputs[i] }));
    } else if (selectedFiles.length === 1) {
      const name = getFileName(selectedFiles[0]);
      const base = getBaseName(name);
      const outputPath = await save({
        defaultPath: base + '.' + config.format,
        filters: [{ name: config.format.toUpperCase(), extensions: [config.format] }]
      });
      if (!outputPath) return;
      jobs = [{ input: selectedFiles[0], output: outputPath }];
    } else {
      const folder = await open({ directory: true, title: t('selectOutputFolder') });
      if (!folder) return;

      // Deduplicate output names to avoid overwriting
      const usedNames = new Map();
      jobs = [];
      for (const input of selectedFiles) {
        const base = getBaseName(getFileName(input));
        const key = base.toLowerCase();
        const count = usedNames.get(key) || 0;
        usedNames.set(key, count + 1);
        const uniqueBase = count === 0 ? base : base + ' (' + (count + 1) + ')';
        const output = await invoke('build_output_path', { folder, name: uniqueBase, extension: config.format });
        jobs.push({ input, output });
      }
    }

    // startBatchConversion synchronously sets isConverting=true before its
    // first await, so subsequent clicks are blocked from here on.
    startBatchConversion(jobs, config);
  } catch (e) {
    console.error('Convert prep error:', e);
    showNotice(t('err_load_failed'), 'warning');
  } finally {
    isPreparingConvert = false;
  }
});

async function startBatchConversion(jobs, config) {
  isConverting = true;
  isCancelled = false;
  isPaused = false;
  currentBatchIndex = 0;
  currentBatchInfo = null;
  convertBtn.disabled = true;
  convertBtn.classList.add('converting');
  doneSection.classList.add('hidden');
  progressSection.classList.remove('hidden');
  resetPauseBtn();

  const isBatch = jobs.length > 1;
  batchStatus.classList.toggle('hidden', !isBatch);

  let failedCount = 0;
  let successCount = 0;
  const succeededPaths = new Set();
  let firstSuccessOutput = null;

  for (let i = 0; i < jobs.length; i++) {
    if (isCancelled) break;
    currentBatchIndex = i;
    const { input, output } = jobs[i];
    const name = getFileName(input);

    // Store batch info so a mid-batch language switch can repaint the UI.
    currentBatchInfo = { currentIndex: i, total: jobs.length, currentName: name };
    updateBatchUI();

    progressBar.style.width = '0%';
    progressBar.classList.remove('paused');
    progressPercent.textContent = '0%';
    progressTime.textContent = '00:00:00';
    progressSpeed.textContent = '';

    try {
      await convertOneFile(input, output, config);
      successCount++;
      succeededPaths.add(input);
      if (!firstSuccessOutput) firstSuccessOutput = output;
    } catch (e) {
      if (isCancelled) break;
      failedCount++;
      if (!isBatch) {
        showDone('error', friendlyError(e));
        return;
      }
    }

    if (isCancelled) break;
  }

  // Remove successfully-converted files so they aren't reconverted next time
  if (succeededPaths.size > 0) {
    selectedFiles = selectedFiles.filter(p => !succeededPaths.has(p));
    renderFileList();
    updateFileCount();
    const hasFiles = selectedFiles.length > 0;
    fileListSection.classList.toggle('hidden', !hasFiles);
    dropZone.classList.toggle('hidden', hasFiles);
  }

  if (isCancelled) {
    showDone('cancelled', t('cancelled'));
  } else if (failedCount === 0) {
    const msg = jobs.length > 1 ? t('allComplete') : t('complete');
    showDone('success', msg, firstSuccessOutput);
  } else if (successCount === 0) {
    showDone('error', t('batchErrors', { n: failedCount }));
  } else {
    showDone('success', t('batchPartial', { success: successCount, failed: failedCount }), firstSuccessOutput);
  }
}

async function convertOneFile(inputPath, outputPath, config) {
  const myId = ++conversionId;

  let resolveDone, rejectDone;
  const donePromise = new Promise((res, rej) => {
    resolveDone = res;
    rejectDone = rej;
  });

  // Register listeners BEFORE invoking — fast conversions (e.g. -c:a copy
  // on a small mp3) can emit conversion-done before we'd otherwise be ready.
  const [unlistenProgress, unlistenDone] = await Promise.all([
    listen('conversion-progress', (event) => {
      if (event.payload.id !== myId) return;
      const { percent, time, speed } = event.payload;
      progressBar.style.width = percent.toFixed(1) + '%';
      progressPercent.textContent = percent.toFixed(1) + '%';
      progressTime.textContent = time;
      progressSpeed.textContent = speed;
    }),
    listen('conversion-done', (event) => {
      if (event.payload.id !== myId) return;
      const { success, message } = event.payload;
      if (success) resolveDone();
      else rejectDone(message);
    }),
  ]);

  try {
    await invoke('convert_file', {
      inputPath,
      outputPath,
      format: config.format,
      bitrate: config.bitrate,
      sampleRate: config.sampleRate,
      maxQuality: config.maxQuality,
      conversionId: myId,
    });
    await donePromise;
  } finally {
    unlistenProgress();
    unlistenDone();
  }
}

// ============ Pause ============
pauseBtn.addEventListener('click', async () => {
  if (!isConverting) return;
  try {
    const nowPaused = await invoke('pause_conversion');
    isPaused = nowPaused;
    if (isPaused) {
      pauseIcon.classList.add('hidden');
      resumeIcon.classList.remove('hidden');
      pauseText.textContent = t('resume');
      pauseBtn.classList.add('paused');
      progressBar.classList.add('paused');
      convertBtn.querySelector('.btn-text').textContent = t('paused');
    } else {
      resetPauseBtn();
      progressBar.classList.remove('paused');
      updateBatchUI();
    }
  } catch (e) {
    console.error('Pause error:', e);
  }
});

function resetPauseBtn() {
  isPaused = false;
  pauseIcon.classList.remove('hidden');
  resumeIcon.classList.add('hidden');
  pauseText.textContent = t('pause');
  pauseBtn.classList.remove('paused');
}

// ============ Cancel ============
cancelBtn.addEventListener('click', async () => {
  if (!isConverting) return;
  isCancelled = true;
  try {
    await invoke('cancel_conversion');
  } catch (_) { /* no active conversion */ }
  // Don't call showDone here — the convertOneFile Promise will settle
  // via the conversion-done event from Rust, and startBatchConversion
  // will handle showing the cancelled state.
});

// ============ Done ============
function showDone(status, message, outputPath) {
  isConverting = false;
  isPaused = false;
  isCancelled = false;
  currentBatchInfo = null;
  convertBtn.disabled = selectedFiles.length === 0;
  convertBtn.classList.remove('converting');
  updateConvertBtnText();
  progressSection.classList.add('hidden');
  doneSection.classList.remove('hidden');

  if (status === 'success') {
    doneIcon.textContent = '\u2713';
    doneIcon.className = 'done-icon success';
  } else if (status === 'cancelled') {
    doneIcon.textContent = '\u25CB';
    doneIcon.className = 'done-icon cancelled';
  } else {
    doneIcon.textContent = '\u2715';
    doneIcon.className = 'done-icon error';
  }
  doneMessage.textContent = message;

  // Show location + open-folder button only on success with a known path.
  lastOutputPath = (status === 'success' && outputPath) ? outputPath : null;
  if (lastOutputPath) {
    const folder = lastOutputPath.replace(/[\\/][^\\/]+$/, '');
    doneLocation.textContent = t('savedTo', { folder });
    doneLocation.classList.remove('hidden');
    openFolderBtn.classList.remove('hidden');
  } else {
    doneLocation.classList.add('hidden');
    openFolderBtn.classList.add('hidden');
  }
}

openFolderBtn.addEventListener('click', () => {
  if (!lastOutputPath) return;
  invoke('open_in_explorer', { path: lastOutputPath });
});