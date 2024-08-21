const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const { dialog } = require('electron');
const ejse = require('ejs-electron');
const path = require('node:path');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
//      <script src="./net.js"></script>

var mainWindow = null;
app.once('ready', (event, arg) => {
  // mainWindowを作成（windowの大きさや、Kioskモードにするかどうかなどもここで定義できる）
  mainWindow = new BrowserWindow({
    width: 640,
    height: 360,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
/*
      preload: path.join(__dirname, "preload.js"),
      preload: path.join(__dirname, "net.js"),
      preload: path.join(__dirname, "tcp_proxy.js"),
*/  
    },
  });
  // Electronに表示するhtmlを絶対パスで指定（相対パスだと動かない）
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // ChromiumのDevツールを開く
  mainWindow.webContents.openDevTools();
  
  mainWindow.on('closed', function() {
    mainWindow = null;
  });

});
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
// EJSでステータス更新
ipcMain.on('show', async (event, arg) => {
  ejse.data('data',arg);
  mainWindow.loadURL('file://' + __dirname + '/../views/index.ejs');
});
ipcMain.on('manual', async (event, arg) => {
  ejse.data('data',arg);
  mainWindow.loadURL('file://' + __dirname + '/../views/manual.ejs');
});

// 選択ダイアログ
ipcMain.on('select', async (event,arg) => {
/*
  var options = {
    type: 'none',
    title: 'Select IP Address',
    message: 'IPアドレス待ち受け選択',
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
*/
  var options = {
    type: 'none',
    title: 'chromedriverを選んで下さい',
    message: 'IPアドレス待ち受け選択',
    buttons: []
  };
  options.defaultPath = app.getPath('home');
  dialog
    .showOpenDialogSync(mainWindow,options)
});

