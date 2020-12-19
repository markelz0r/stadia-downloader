const { ipcMain } = require('electron')
const { ipcMain : mock } = require('./test/mocks/electron-mock')
 
if (process.env.NODE_ENV === 'test') {
  global.ipcMain = mock
} else {
  global.ipcMain = ipcMain
}