// Native

// Packages
import {
  BrowserWindow,
  app,
  screen,
  session,
  WebContents,
  HandlerDetails,
  ipcMain,
  Menu,
  MenuItem,
  WebPreferences,
} from 'electron';
import isDev from 'electron-is-dev';
import { autoUpdater } from 'electron-updater';
import { join, extname } from 'path';
import { SOLOBAN_CLIENT_URL, ALLOW_DOWNLOAD_EXTENSIONS } from './constants';

const url = SOLOBAN_CLIENT_URL || `http://localhost:8080`;

let windowCounter = 0;

function createWindow(isMainWindow = true) {
  const screenSize = screen.getPrimaryDisplay().size;

  if (!isMainWindow) ++windowCounter;

  let win: BrowserWindow | null = new BrowserWindow({
    width: screenSize.width - 200,
    height: screenSize.height - 200,
    webPreferences: {
      webSecurity: !isDev,
      devTools: isDev,
      webviewTag: true,
      preload: join(app.getAppPath(), 'main', 'preload.js'),
      ...(isMainWindow
        ? {}
        : {
            session: session.fromPartition(`${windowCounter}`),
            partition: `${windowCounter}`,
          }),
    },
  });
  if (isDev) win.webContents.openDevTools();
  if (isMainWindow)
    win.once('ready-to-show', () => {
      autoUpdater.checkForUpdatesAndNotify();
    });
  win.setMenuBarVisibility(isDev);

  win.loadURL(url);

  win.webContents.on('ipc-message', function (_event, channel) {
    switch (channel) {
      case 'init_load':
        win?.webContents.send('init_load', {
          isMainWindow,
          windowCounter,
        });
        break;
    }
  });

  win.on('closed', () => {
    win = null;
    if (isMainWindow) {
      app.quit();
    }
  });
}

// App

app.on('ready', function () {
  createWindow();
});

// Quit the app once all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('web-contents-created', function (_e, contents) {
  if (contents.getType() === 'window') {
    contents
      .on('will-attach-webview', handleEventWillAttachWebview)
      .on('did-attach-webview', handleEventDidAttachWebview);
  }
});

// Autoupdate
autoUpdater.on('update-downloaded', function () {
  autoUpdater.quitAndInstall(false, false);
});

// ipcMain
ipcMain.on('new_window', function (_event) {
  createWindow(false);
});

// Handle Event
function handleEventWillAttachWebview(
  _event: Event,
  webPreferences: WebPreferences,
  param: Record<string, string>
) {
  if (!param.src) return;

  const host = new URL(param.src).host;
  let preloadFile;

  switch (host) {
    case 'teams.live.com':
      preloadFile = join(app.getAppPath(), 'main', 'preload-ms-teams.js');
      break;
    case 'meet.google.com':
      preloadFile = join(app.getAppPath(), 'main', 'preload-google-meet.js');
      break;
  }
  if (preloadFile) webPreferences.preload = preloadFile;
}

function handleEventDidAttachWebview(
  this: WebContents,
  _event: Event,
  webContents: WebContents
) {
  const contents = this;
  webContents.setWindowOpenHandler((details: HandlerDetails) => {
    const ext = extname(details.url);
    if (ALLOW_DOWNLOAD_EXTENSIONS.indexOf(ext)) {
      webContents.downloadURL(details.url);
      return {
        action: 'deny',
      };
    }
    contents.send('new_window_webview', details.url);
    return {
      action: 'allow',
    };
  });

  webContents.on('context-menu', function (_event, param) {
    if (param.hasImageContents && param.srcURL) {
      const menu = new Menu();
      menu.append(
        new MenuItem({
          label: 'Save image as',
          click: () => webContents.downloadURL(param.srcURL),
        })
      );

      menu.popup();
    }
  });
}
