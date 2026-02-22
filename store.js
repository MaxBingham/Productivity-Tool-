const fs = require('fs');
const path = require('path');

function getDataDir(app) {
  const userData = app.getPath('userData');
  const dir = path.join(userData, 'time-blocker');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getPlansPath(app) {
  return path.join(getDataDir(app), 'plans.json');
}

function getSettingsPath(app) {
  return path.join(getDataDir(app), 'settings.json');
}

function getPlan(app, dateStr) {
  const filePath = getPlansPath(app);
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data[dateStr] || [];
}

function setPlan(app, dateStr, blocks) {
  const filePath = getPlansPath(app);
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  data[dateStr] = blocks;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

const DEFAULT_SETTINGS = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakAfterSessions: 4,
  lunchStart: '12:00',
  lunchEnd: '13:30',
  lunchBreakMinutes: 25
};

function getSettings(app) {
  const filePath = getSettingsPath(app);
  if (!fs.existsSync(filePath)) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(filePath, 'utf8')) };
}

function setSettings(app, settings) {
  const filePath = getSettingsPath(app);
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8');
}

module.exports = { getPlan, setPlan, getSettings, setSettings, getDataDir };
