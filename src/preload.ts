import { contextBridge, ipcRenderer } from 'electron';

ipcRenderer.send('init_load');
ipcRenderer.on('init_load', function (_event, data) {
  if (typeof data === 'object') {
    contextBridge.exposeInMainWorld('windowInfo', data);
    ipcRenderer.removeAllListeners('init_load');
  }
});

contextBridge.exposeInMainWorld('electron', {
  listenOpenNewTab: (callback: (url: string) => void) => {
    ipcRenderer.on('new_window_webview', (_event, url: string) =>
      callback(url)
    );
  },
  createNewWindow: () => {
    ipcRenderer.send('new_window');
  },
});

export {};
