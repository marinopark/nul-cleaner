import './style.css';
import mascotUrl from './assets/images/mascot.png';
import {
  Scan, Delete, PickFolder, DefaultFolder,
  StartWatch, StopWatch,
  MinimiseWindow, MaximiseWindow, CloseWindow,
} from '../wailsjs/go/main/App';
import { EventsOn } from '../wailsjs/runtime/runtime';

// ===== i18n =====
const STRINGS = {
  ko: {
    speechBubble: ['NUL 파일', '깨끗하게 정리해줄게!'],
    sidebarFolderTitle: '폴더 선택',
    sidebarFolderDesc: ['NUL 파일을 찾을 폴더를', '선택해주세요.'],
    btnSettings: '설정',
    searchLocationTitle: '검색 위치',
    searchLocationDesc: 'nulCleaner가 NUL 파일을 찾아 정리해요.',
    browse: '찾아보기',
    includeSubfolders: '하위 폴더 포함',
    defaultPath: '기본 경로: 사용자 홈 폴더',
    resultsTitle: '정리 결과',
    statFound: '발견된 NUL 파일',
    statDeleted: '삭제된 파일',
    statFreed: '절약한 공간',
    statDone: '정리 완료!',
    foundFilesHeader: '발견된 파일',
    watchBannerText: '자동 감지 모드 — 새로 생기는 nul 파일을 즉시 삭제합니다.',
    btnFindNul: 'NUL 파일 검색',
    btnDeleteSelected: '선택 파일 삭제',
    statusbarMessage: 'nulCleaner가 깨끗하게 만들어줄께',
    modalTitle: '설정',
    modeGroupTitle: '동작 모드',
    manualModeTitle: '수동 검색',
    manualModeDesc: "필요할 때 'NUL 파일 검색' 버튼으로 직접 스캔합니다.",
    autoModeTitle: '자동 감지',
    autoModeDesc: '선택한 폴더를 1.5초마다 감시하면서 새로 생기는 nul 파일을 즉시 삭제합니다.',
    btnCancel: '취소',
    btnSave: '저장',
    loadingDefault: '잠시만요',
    countItems: '{0}개',
    statusSearching: 'NUL 파일을 찾는 중...',
    loadingSearching: 'NUL 파일을 찾는 중',
    statusFoundCount: '{0}개의 NUL 파일을 발견했어요 ({1}).',
    statusNothingFound: 'NUL 파일을 찾지 못했어요. 깨끗하네요!',
    statusDeleting: 'NUL 파일을 삭제하는 중...',
    loadingDeleting: 'NUL 파일을 삭제하는 중',
    statusCleaned: '{0}개의 NUL 파일을 깨끗이 정리했어요!',
    statusDeleteDone: '완료 — 삭제: {0}, 실패: {1}',
    statusScanError: '스캔 오류: {0}',
    statusDeleteError: '삭제 오류: {0}',
    statusAutoDetecting: '자동 감지 중: {0}',
    statusAutoStartFail: '자동 감지를 시작할 수 없어요. 폴더 경로를 확인해주세요.',
    statusEnterPath: '폴더 경로를 입력해주세요.',
    statusAutoNeedsPath: '자동 감지를 켜려면 폴더 경로를 입력해주세요.',
    statusAutoError: '자동 감지 오류: {0}',
    statusManualSwitched: '수동 검색 모드로 전환했어요.',
    statusWatchDeleted: '[감시] 자동 삭제: {0}',
    statusWatchFailed: '[감시] 삭제 실패: {0}',
    loadingModeSwitch: '모드를 전환하는 중',
  },
  en: {
    speechBubble: ['Time to clean up', 'those NUL files!'],
    sidebarFolderTitle: 'Pick a folder',
    sidebarFolderDesc: ['Choose a folder to scan', 'for NUL files.'],
    btnSettings: 'Settings',
    searchLocationTitle: 'Search location',
    searchLocationDesc: 'nulCleaner finds and tidies up NUL files.',
    browse: 'Browse',
    includeSubfolders: 'Include subfolders',
    defaultPath: 'Default: user home folder',
    resultsTitle: 'Cleanup results',
    statFound: 'NUL files found',
    statDeleted: 'Files deleted',
    statFreed: 'Space freed',
    statDone: 'All clean!',
    foundFilesHeader: 'Found files',
    watchBannerText: 'Auto-detect — new nul files are deleted instantly.',
    btnFindNul: 'Find NUL files',
    btnDeleteSelected: 'Delete selected',
    statusbarMessage: 'nulCleaner keeps things tidy.',
    modalTitle: 'Settings',
    modeGroupTitle: 'Mode',
    manualModeTitle: 'Manual scan',
    manualModeDesc: "Only scans when you click 'Find NUL files'.",
    autoModeTitle: 'Auto-detect',
    autoModeDesc: 'Polls the selected folder every 1.5s and deletes any new nul files instantly.',
    btnCancel: 'Cancel',
    btnSave: 'Save',
    loadingDefault: 'Hold on',
    countItems: '{0}',
    statusSearching: 'Searching for NUL files...',
    loadingSearching: 'Searching for NUL files',
    statusFoundCount: 'Found {0} NUL files ({1}).',
    statusNothingFound: 'No NUL files found — all clean!',
    statusDeleting: 'Deleting NUL files...',
    loadingDeleting: 'Deleting NUL files',
    statusCleaned: 'Cleaned up {0} NUL files!',
    statusDeleteDone: 'Done — deleted: {0}, failed: {1}',
    statusScanError: 'Scan error: {0}',
    statusDeleteError: 'Delete error: {0}',
    statusAutoDetecting: 'Auto-detect: {0}',
    statusAutoStartFail: "Couldn't start auto-detect. Check the folder path.",
    statusEnterPath: 'Please enter a folder path.',
    statusAutoNeedsPath: 'Enter a folder path to enable auto-detect.',
    statusAutoError: 'Auto-detect error: {0}',
    statusManualSwitched: 'Switched to manual scan.',
    statusWatchDeleted: '[watch] auto-deleted: {0}',
    statusWatchFailed: '[watch] delete failed: {0}',
    loadingModeSwitch: 'Switching mode',
  },
};

function pickLocale() {
  try {
    const forced = localStorage.getItem('nulCleaner.lang');
    if (forced && STRINGS[forced]) return forced;
  } catch {}
  const lang = (navigator.language || 'en').toLowerCase();
  if (lang.startsWith('ko')) return 'ko';
  return 'en';
}
const LOCALE = pickLocale();
const STR = STRINGS[LOCALE];

function t(key, ...args) {
  let v = STR[key];
  if (v === undefined) v = STRINGS.en[key];
  if (v === undefined) return key;
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string') return String(v);
  if (args.length === 0) return v;
  return v.replace(/\{(\d+)\}/g, (_, i) => (args[i] !== undefined ? args[i] : ''));
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function applyI18N() {
  document.documentElement.lang = LOCALE;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = t(el.dataset.i18n);
    el.textContent = Array.isArray(v) ? v.join(' ') : v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const v = t(el.dataset.i18nHtml);
    if (Array.isArray(v)) {
      el.innerHTML = v.map(escapeHTML).join('<br>');
    } else {
      el.innerHTML = escapeHTML(v);
    }
  });
}

// ===== Mascot images =====
document.querySelectorAll('[data-mascot]').forEach((img) => {
  img.src = mascotUrl;
});

const $ = (id) => document.getElementById(id);

const els = {
  pathInput: $('path-input'),
  recursive: $('chk-recursive'),
  btnBrowse: $('btn-browse'),
  btnScan:   $('btn-scan'),
  btnDelete: $('btn-delete'),
  btnSettings: $('btn-settings'),
  btnMin:    $('btn-min'),
  btnMax:    $('btn-max'),
  btnClose:  $('btn-close'),
  statFound: $('stat-found'),
  statDeleted: $('stat-deleted'),
  statFreed: $('stat-freed'),
  statDone:  $('stat-done'),
  status:    $('status-message'),
  fileList:  $('file-list'),
  fileListItems: $('file-list-items'),
  fileListCount: $('file-list-count'),
  watchBanner: $('watch-banner'),
  modal:     $('modal-settings'),
  btnSettingsClose:  $('btn-settings-close'),
  btnSettingsCancel: $('btn-settings-cancel'),
  btnSettingsSave:   $('btn-settings-save'),
  loading:     $('loading-overlay'),
  loadingText: $('loading-text'),
};

function showLoading(text) {
  els.loadingText.textContent = text || t('loadingDefault');
  els.loading.hidden = false;
  els.loading.style.display = 'flex';
}
function hideLoading() {
  els.loading.hidden = true;
  els.loading.style.display = 'none';
}
async function withLoading(text, fn) {
  showLoading(text);
  try {
    return await fn();
  } finally {
    hideLoading();
  }
}

let lastScanned = [];
let settings = loadSettings();

function loadSettings() {
  try {
    const raw = localStorage.getItem('nulCleaner.settings');
    if (raw) return Object.assign({ mode: 'manual' }, JSON.parse(raw));
  } catch {}
  return { mode: 'manual' };
}

function saveSettings(s) {
  try { localStorage.setItem('nulCleaner.settings', JSON.stringify(s)); } catch {}
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function setStatus(msg) {
  els.status.textContent = msg;
}

function setFreedDisplay(bytes) {
  const [num, unit] = formatBytes(bytes).split(' ');
  els.statFreed.textContent = num;
  els.statFreed.dataset.bytes = String(bytes);
  document.querySelector('.stat-unit').textContent = ' ' + (unit || 'KB');
}

function renderFileList(files) {
  els.fileListItems.innerHTML = '';
  if (!files || files.length === 0) {
    els.fileList.hidden = true;
    return;
  }
  els.fileList.hidden = false;
  els.fileListCount.textContent = t('countItems', files.length);
  for (const f of files) {
    const li = document.createElement('li');
    const path = document.createElement('span');
    path.className = 'path';
    path.textContent = f.path;
    path.title = f.path;
    const size = document.createElement('span');
    size.className = 'size';
    size.textContent = formatBytes(f.size || 0);
    li.appendChild(path);
    li.appendChild(size);
    els.fileListItems.appendChild(li);
  }
}

async function init() {
  applyI18N();
  try {
    const home = await DefaultFolder();
    els.pathInput.value = home || 'C:\\';
  } catch {
    els.pathInput.value = 'C:\\';
  }
  setFreedDisplay(0);
  applyMode();
}

function applyMode() {
  if (settings.mode === 'auto') {
    enterAutoMode();
  } else {
    enterManualMode();
  }
}

function showWatchBanner(show) {
  els.watchBanner.hidden = !show;
  els.watchBanner.style.display = show ? 'flex' : 'none';
}

async function enterAutoMode() {
  const root = els.pathInput.value.trim();
  if (!root) {
    setStatus(t('statusAutoNeedsPath'));
    return;
  }
  try {
    const ok = await StartWatch(root, els.recursive.checked);
    if (ok) {
      showWatchBanner(true);
      els.btnScan.disabled = true;
      els.btnDelete.disabled = true;
      setStatus(t('statusAutoDetecting', root));
    } else {
      setStatus(t('statusAutoStartFail'));
    }
  } catch (e) {
    setStatus(t('statusAutoError', e));
  }
}

async function enterManualMode() {
  try { await StopWatch(); } catch {}
  showWatchBanner(false);
  els.btnScan.disabled = false;
  els.btnDelete.disabled = lastScanned.length === 0;
}

// === watch event subscriptions ===
EventsOn('watch:deleted', (payload) => {
  const path = payload?.path || '';
  const size = payload?.size || 0;
  const prevDeleted = parseInt(els.statDeleted.textContent || '0', 10) || 0;
  const prevDone = parseInt(els.statDone.textContent || '0', 10) || 0;
  const prevBytes = parseFloat(els.statFreed.dataset.bytes || '0') || 0;
  els.statDeleted.textContent = String(prevDeleted + 1);
  els.statDone.textContent = String(prevDone + 1);
  setFreedDisplay(prevBytes + size);
  setStatus(t('statusWatchDeleted', path));
});

EventsOn('watch:failed', (payload) => {
  setStatus(t('statusWatchFailed', payload?.path || ''));
});

// === window controls ===
els.btnMin.addEventListener('click', () => MinimiseWindow());
els.btnMax.addEventListener('click', () => MaximiseWindow());
els.btnClose.addEventListener('click', () => CloseWindow());

// === folder picker ===
els.btnBrowse.addEventListener('click', async () => {
  const picked = await PickFolder();
  if (picked) {
    els.pathInput.value = picked;
    if (settings.mode === 'auto') {
      await StopWatch();
      enterAutoMode();
    }
  }
});

els.recursive.addEventListener('change', async () => {
  if (settings.mode === 'auto') {
    await StopWatch();
    enterAutoMode();
  }
});

// === scan / delete ===
els.btnScan.addEventListener('click', async () => {
  const root = els.pathInput.value.trim();
  if (!root) {
    setStatus(t('statusEnterPath'));
    return;
  }
  els.btnScan.disabled = true;
  setStatus(t('statusSearching'));
  try {
    const files = await withLoading(t('loadingSearching'), () =>
      Scan(root, els.recursive.checked));
    lastScanned = files || [];
    els.statFound.textContent = String(lastScanned.length);
    renderFileList(lastScanned);
    els.btnDelete.disabled = lastScanned.length === 0;
    if (lastScanned.length === 0) {
      setStatus(t('statusNothingFound'));
    } else {
      const totalSize = lastScanned.reduce((acc, f) => acc + (f.size || 0), 0);
      setStatus(t('statusFoundCount', lastScanned.length, formatBytes(totalSize)));
    }
  } catch (e) {
    setStatus(t('statusScanError', e));
  } finally {
    els.btnScan.disabled = false;
  }
});

els.btnDelete.addEventListener('click', async () => {
  if (lastScanned.length === 0) return;
  els.btnDelete.disabled = true;
  els.btnScan.disabled = true;
  setStatus(t('statusDeleting'));
  try {
    const res = await withLoading(t('loadingDeleting'), () =>
      Delete(lastScanned));
    const prevDeleted = parseInt(els.statDeleted.textContent || '0', 10) || 0;
    const prevDone = parseInt(els.statDone.textContent || '0', 10) || 0;
    const prevBytes = parseFloat(els.statFreed.dataset.bytes || '0') || 0;
    els.statDeleted.textContent = String(prevDeleted + res.deleted);
    els.statDone.textContent = String(prevDone + (res.failed === 0 ? 1 : 0));
    setFreedDisplay(prevBytes + (res.bytesFreed || 0));

    lastScanned = [];
    els.statFound.textContent = '0';
    renderFileList([]);

    if (res.failed > 0) {
      setStatus(t('statusDeleteDone', res.deleted, res.failed));
      console.error('Delete errors:', res.errors);
    } else {
      setStatus(t('statusCleaned', res.deleted));
    }
  } catch (e) {
    setStatus(t('statusDeleteError', e));
  } finally {
    els.btnScan.disabled = false;
  }
});

// === settings modal ===
function selectModeUI(mode) {
  document.querySelectorAll('input[name="mode"]').forEach((r) => {
    r.checked = r.value === mode;
  });
  document.querySelectorAll('.setting-option').forEach((el) => {
    const input = el.querySelector('input[name="mode"]');
    el.classList.toggle('selected', input && input.checked);
  });
}

function openSettings() {
  selectModeUI(settings.mode);
  els.modal.hidden = false;
  els.modal.style.display = 'flex';
}
function closeSettings() {
  els.modal.hidden = true;
  els.modal.style.display = 'none';
}

document.querySelectorAll('.setting-option').forEach((label) => {
  label.addEventListener('click', () => {
    const input = label.querySelector('input[name="mode"]');
    if (input) selectModeUI(input.value);
  });
});

els.btnSettings.addEventListener('click', openSettings);
els.btnSettingsClose.addEventListener('click', closeSettings);
els.btnSettingsCancel.addEventListener('click', closeSettings);
els.modal.addEventListener('click', (e) => {
  if (e.target === els.modal) closeSettings();
});
els.btnSettingsSave.addEventListener('click', async () => {
  const picked = document.querySelector('input[name="mode"]:checked');
  const newMode = picked ? picked.value : 'manual';
  settings.mode = newMode;
  saveSettings(settings);
  closeSettings();
  await withLoading(t('loadingModeSwitch'), async () => {
    if (newMode === 'auto') {
      await enterAutoMode();
    } else {
      await enterManualMode();
    }
  });
  if (newMode === 'manual') {
    setStatus(t('statusManualSwitched'));
  }
});

init();
