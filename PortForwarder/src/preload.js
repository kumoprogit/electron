const { ipcRenderer } = require('electron');

window.show = (arg) => {
    return ipcRenderer.invoke('show',arg);
};
window.manual = (arg) => {
    return ipcRenderer.invoke('manual',arg);
};
window.select = (arg) => {
    return ipcRenderer.invoke('select',arg);
};
