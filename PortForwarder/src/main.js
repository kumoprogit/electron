const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const { dialog } = require('electron');

global.ipno = 0;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

var mainWindow = null;
app.once('ready', () => {
  // mainWindowを作成（windowの大きさや、Kioskモードにするかどうかなどもここで定義できる）
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  // Electronに表示するhtmlを絶対パスで指定（相対パスだと動かない）
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // ChromiumのDevツールを開く
  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
ipcMain.on('show', (_, arg) => {
  console.log("show");
  console.log(arg);
});
ipcMain.on('add', (_, arg) => {
  console.log("add");
  console.log(arg);
});
ipcMain.on('select', async (event,arg) => {
  //console.log(arg);
  var options = {
    type: 'none',
    title: 'Select IP Address',
    buttons: []
  };
  for (let i=0;i<arg.length;i++) {
    if (arg[i] === 0 ) continue;
    let str = String(arg[i])
    options.buttons[i] = str;
  }
  dialog
    .showMessageBox(mainWindow,options)
    .then((result) => {
      //console.log(result.response);
      event.sender.send('select', result.response);
    });
});

