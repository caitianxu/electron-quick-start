const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const config = require('./src/script/config');
// bug 禁用电池覆盖
app.allowRendererProcessReuse = true;
// 关闭安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
//启用flash
const pepflashplayer = process.arch == 'x64' ? `${__dirname}/flash/pepflashplayer64_32_0_0_363.dll` : `${__dirname}/flash/pepflashplayer32_32_0_0_363.dll`;
//设定插件
app.commandLine.appendSwitch('ppapi-flash-path', pepflashplayer);
//设定插件版本（不知道是否真有用，不匹配貌似也能运行）
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.363');

//窗口对象
let mainWindow = null;
//托盘
let appTray = null;
/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    frame: false, //无边框
    resizable: false, //禁止改变大小
    // transparent: true, //透明窗口
    backgroundColor: '#27214a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      plugins: true,
      webviewTag: true,
    },
  });
  // mainWindow.loadURL('http://localhost:3000?channelId=3000&inner=electron');
  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
  //注册快捷键
  addKeyboard();
}
/**
 * 创建托盘图标
 */
function createAppTray() {
  appTray = new Tray('assets/img/favicon.ico');
  appTray.setToolTip(`${config.name}\n发布时间：${config.publishTime}\n版本号：${config.version}`);
  //系统托盘右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      click: function () {
        app.quit();
        mainWindow = null;
      },
    },
  ]);
  //设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);
  //显示主窗口
  appTray.on('click', function () {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    } else {
      mainWindow.minimize();
    }
  });
}
/**
 * 添加全局快捷键
 */
function addKeyboard() {
  //刷新页面
  globalShortcut.register('F5', () => {
    mainWindow.webContents.reload();
  });
  //禁用F11
  globalShortcut.register('F11', () => {});
  //开发者工具
  globalShortcut.register('ctrl+F12', () => {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools({
        activate: true,
        mode: 'detach',
      });
    }
  });
}

//应用初始
app.whenReady().then(() => {
  createWindow();
  createAppTray();
  //事件注册
  window.electronConconfig = { ...config };
});
//将要退出时
app.on('will-quit', () => {
  //注销所有快捷键
  globalShortcut.unregisterAll();
});
//监控关闭
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
    mainWindow = null;
  }
});
//监听进入
app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
