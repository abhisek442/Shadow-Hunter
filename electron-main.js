const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
  require('./server.js'); // the app is also a LAN host
  const w = new BrowserWindow({ width: 1280, height: 720, autoHideMenuBar: true, backgroundColor: '#0e101a', title: 'Shadow Hunter' });
  w.loadURL('http://localhost:3000');
});
app.on('window-all-closed', () => app.quit());
