const { app, screen, BrowserWindow } = require('electron');
const { promises: { readFile, writeFile }} = require('fs');
const { resolve } = require('path');

const SETTINGS_PATH = resolve(app.getPath('userData'), 'settings.json');
const TASKS_URL = 'https://tasks.google.com/embed/?origin=https://calendar.google.com';

function clamp(value, max = 0, min = 0) {
  return Math.max(min, Math.min(value, max));
}

async function readSettings() {
  try {
    return JSON.parse(await readFile(SETTINGS_PATH));
  } catch {
    return {};
  }
}

async function writeSettings(settings) {
  await writeFile(SETTINGS_PATH, JSON.stringify(settings));
}

async function createWindow() {
  const { workArea } = screen.getPrimaryDisplay();
  const settings = await readSettings();

  settings.height &&= clamp(settings.height, workArea.height);
  settings.width &&= clamp(settings.width, workArea.width);
  settings.x &&= clamp(settings.x, workArea.width - settings.width);
  settings.y &&= clamp(settings.y, workArea.width - settings.height);

  const window = new BrowserWindow(settings);

  window.loadURL(TASKS_URL);

  window.on('close', async () => {
    const { height, width, x, y } = window.getBounds();
    await writeSettings({ height, width, x, y });
  });
}

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') return;
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length) return;
  createWindow();
});

app.on('ready', () => {
  if (BrowserWindow.getAllWindows().length) return;
  createWindow();
});
