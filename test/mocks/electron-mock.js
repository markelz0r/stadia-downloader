var m = require('electron-mock-ipc')

var mock = m.default()
exports.ipcMain = mock.ipcMain
exports.ipcRenderer = mock.ipcRenderer

