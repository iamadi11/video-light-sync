import { app, BrowserWindow } from 'electron';
import path from 'path';
import { LightSyncServer } from '@video-light-sync/transport';
import { YeelightAdapter } from '@video-light-sync/adapters-yeelight';
import { WledAdapter } from '@video-light-sync/adapters-wled';

// Keep server instance global so it doesn't get GC'd
let server: LightSyncServer | null = null;
let mainWindow: BrowserWindow | null = null;

function startHub() {
  try {
    const yeelight = new YeelightAdapter(null); // Mock
    const wled = new WledAdapter(null); // Mock
    server = new LightSyncServer(3001, [yeelight, wled]);
    console.log('[Desktop] Hub started on port 3001');
  } catch (e) {
    console.error('[Desktop] Failed to start hub:', e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'Video Light Sync Hub'
  });

  // For this phase, we just show a simple status page.
  // In a real app, we'd load the "apps/controller" URL or bundle.
  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <html>
      <body style="background: #111; color: #eee; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        <h1>Hub Running</h1>
        <p>LightSync Server active on port 3001</p>
        <p style="opacity: 0.7">Run the Web Capture app to sync lights.</p>
        <br>
        <button onclick="require('electron').shell.openExternal('http://localhost:3002')">Open Controller (Web)</button>
      </body>
    </html>
  `));
}

app.whenReady().then(() => {
  startHub();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
