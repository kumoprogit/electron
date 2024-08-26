const { ipcRenderer } = require('electron');

window.child = (arg) => {
  return ipcRenderer.invoke('child',arg);
};
window.close = (arg) => {
  return ipcRenderer.invoke('close',arg);
};
