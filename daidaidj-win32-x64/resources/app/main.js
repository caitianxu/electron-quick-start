const {app, BrowserWindow} = require('electron')
const path = require('path');
// bug 禁用电池覆盖
app.allowRendererProcessReuse = true;
// 关闭安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
//启用flash
const pepflashplayer = (process.arch == 'x64')? `${__dirname}/flash/pepflashplayer64_32_0_0_363.dll`:`${__dirname}/flash/pepflashplayer32_32_0_0_363.dll`;
//设定插件
app.commandLine.appendSwitch('ppapi-flash-path', pepflashplayer);
//设定插件版本（不知道是否真有用，不匹配貌似也能运行）
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.363');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    frame: false, //无边框
    resizable: false, //禁止改变大小
    // transparent: true, //透明窗口
    backgroundColor: '#27214a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      plugins: true
    }
  })
  mainWindow.loadURL('https://play.daidaidj.com');
  // mainWindow.loadFile('index.html')
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
