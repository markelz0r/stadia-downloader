const { app, BrowserWindow }  = require('electron')
require("./Controllers/MainController.js")

require('electron-reload')(__dirname);

function createWindow () {
  const win = new BrowserWindow({
    width: 500,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      spellcheck: false,
      enableRemoteModule: true
    }
  })

  win.removeMenu() 
//win.webContents.openDevTools()
  win.loadFile('Views/Main/main.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})