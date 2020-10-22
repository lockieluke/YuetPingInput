const {ipcRenderer} = require('electron')

window.onload = function () {
    ipcRenderer.send('init-webview')
}