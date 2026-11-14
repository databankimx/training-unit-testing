// preload.js
//
// The only bridge between the lesson page and the main process. It exposes a fixed list of functions and nothing
// else. The page has no Node access, and these functions pass only plain data.

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('runner', {
  listCatalog: () => ipcRenderer.invoke('catalog:list'),
  listParts: () => ipcRenderer.invoke('catalog:parts'),
  openLesson: (id) => ipcRenderer.invoke('lesson:open', id),
  getState: () => ipcRenderer.invoke('state:get'),
  visit: (id) => ipcRenderer.invoke('state:visit', id),
  recordProgress: (id, kind, index, value) => ipcRenderer.invoke('progress:record', id, kind, index, value),
  resetProgress: () => ipcRenderer.invoke('progress:reset'),
  onProgressReset: (callback) => {
    ipcRenderer.on('progress:reset', () => callback());
  },
  revealSolutions: (id) => ipcRenderer.invoke('solutions:reveal', id),
  toolchains: () => ipcRenderer.invoke('toolchains:get'),
  highlight: (code, language) => ipcRenderer.invoke('code:highlight', code, language),
  runCode: (id, language, code) => ipcRenderer.invoke('run:start', id, language, code),
  runSample: (id, language, code) => ipcRenderer.invoke('sample:run', id, language, code),
  stopRun: () => ipcRenderer.invoke('run:stop'),
  checkCode: (id, language, code) => ipcRenderer.invoke('check:run', id, language, code),
  onRunEvent: (callback) => {
    ipcRenderer.on('run:event', (_event, payload) => callback(payload));
  },
  openReport: () => ipcRenderer.invoke('report:open'),
  openExternal: (url) => ipcRenderer.invoke('link:open', url),
  openDataFile: (name) => ipcRenderer.invoke('data:open', name),
  openDataFileInEditor: (name) => ipcRenderer.invoke('data:edit', name),
  popOutLesson: (id) => ipcRenderer.invoke('popout:open', id),
  popoutNavigated: (id) => ipcRenderer.invoke('popout:navigated', id),
  syncPopout: (id) => ipcRenderer.invoke('popout:sync', id),
  closePopout: () => ipcRenderer.invoke('popout:close'),
  popoutState: () => ipcRenderer.invoke('popout:state'),
  onPopoutState: (callback) => {
    ipcRenderer.on('popout:state', (_event, state) => callback(state));
  },
  onShowLesson: (callback) => {
    ipcRenderer.on('page:show', (_event, id) => callback(id));
  },
  onPageNavigated: (callback) => {
    ipcRenderer.on('page:navigated', (_event, id) => callback(id));
  },
});
