require('./preload')

const { app, BrowserWindow }  = require('electron')
const { autoUpdater } = require("electron-updater")

require("./Controllers/MainController.js")
require('electron-reload')(__dirname);


function createWindow () {
  const win = new BrowserWindow({
    width: 550,
    height: 200,
    icon: __dirname + 'img/logo.png',
    webPreferences: {
      nodeIntegration: true,
      spellcheck: false,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })

  win.removeMenu() 
  win.setResizable(false);
  win.loadFile('Views/Main/main.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})