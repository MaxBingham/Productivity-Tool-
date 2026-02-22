const { app, BrowserWindow, ipcMain, Tray, Menu, screen, Notification, nativeImage } = require('electron');
const path = require('path');
const store = require('./store');
const { expandBlocksToSegments } = require('./pomodoro');

let mainWindow = null;
let overlayWindow = null;
let tray = null;
let lastNotifiedSegmentKey = null;
const SCHEDULER_INTERVAL_MS = 60 * 1000;

function getTodayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 560,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

function createOverlayWindow() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const w = 280;
  const h = 380;
  overlayWindow = new BrowserWindow({
    width: w,
    height: h,
    x: sw - w - 16,
    y: 16,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  overlayWindow.loadFile(path.join(__dirname, 'src', 'overlay.html'));
  overlayWindow.setVisibleOnAllWorkspaces(true);
  overlayWindow.on('closed', () => { overlayWindow = null; });
}

function runNotificationScheduler() {
  const today = getTodayDateStr();
  const blocks = store.getPlan(app, today);
  const settings = store.getSettings(app);
  const segments = expandBlocksToSegments(blocks, settings);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  function segmentToMin(str) {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
  }

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const startMin = segmentToMin(seg.start);
    const endMin = segmentToMin(seg.end);
    const key = `${i}-${seg.start}-${seg.end}`;
    if (nowMin >= startMin && nowMin < endMin) {
      if (lastNotifiedSegmentKey !== key) {
        lastNotifiedSegmentKey = key;
        const title = seg.type === 'work' ? 'Work' : seg.type === 'shortBreak' ? 'Short break' : seg.type === 'longBreak' ? 'Long break' : 'Lunch break';
        const body = seg.topic ? seg.topic : `${title} (${seg.start} – ${seg.end})`;
        if (Notification.isSupported()) new Notification({ title, body }).show();
      }
      return;
    }
  }
  lastNotifiedSegmentKey = null;
}

ipcMain.handle('getPlan', (_, dateStr) => store.getPlan(app, dateStr));
ipcMain.handle('setPlan', (_, dateStr, blocks) => store.setPlan(app, dateStr, blocks));
ipcMain.handle('getSettings', () => store.getSettings(app));
ipcMain.handle('setSettings', (_, s) => store.setSettings(app, s));

ipcMain.handle('getTodaySegments', (_, dateStr) => {
  const blocks = store.getPlan(app, dateStr);
  const settings = store.getSettings(app);
  return expandBlocksToSegments(blocks, settings);
});

app.whenReady().then(() => {
  createMainWindow();
  createOverlayWindow();
  setInterval(runNotificationScheduler, SCHEDULER_INTERVAL_MS);
  runNotificationScheduler();

  const iconPath = path.join(__dirname, 'src', 'icon.png');
  const icon = require('fs').existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
  tray = new Tray(icon.isEmpty() ? nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHklEQVQ4T2NkYGD4z0ABYBw1gGE0DBhGwwAGBgYABawBDXggn2cAAAAASUVORK5CYII=') : icon);
  tray.setToolTip('Time Blocker');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show plan', click: () => { if (mainWindow) mainWindow.show(); } },
    { label: 'Show overlay', click: () => { if (overlayWindow) overlayWindow.show(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]));
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!mainWindow) createMainWindow(); });
