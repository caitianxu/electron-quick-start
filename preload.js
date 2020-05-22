const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  window.electronEvents = {
    minimize: function () {
      ipcRenderer.send('web-minimize');
    },
    quit: function () {
      ipcRenderer.send('web-quit');
    },
    openDevTools: function () {
      ipcRenderer.send('open-dev-tools');
    },
  };
});
