const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const config = require('./src/script/config');
// bug 禁用电池覆盖
app.allowRendererProcessReuse = true;
// 关闭安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

//窗口对象
let mainWindow = null;
//托盘
let appTray = null;
//静态根路径
let staticPath = __dirname.indexOf('app.asar') === -1 ? '/' : '../';
/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    frame: false, //无边框
    resizable: false, //禁止改变大小
    backgroundColor: '#27214a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      plugins: true,
    },
  });
  mainWindow.loadURL('https://test-play.daidaidj.com?channelId=3000&client=electron');
  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    event.preventDefault();
    shell.openExternal(url);
  });
  //注册快捷键
  addKeyboard();
}
/**
 * 创建托盘图标
 */
function createAppTray() {
  appTray = new Tray(path.join(__dirname, `${staticPath}resources/favicon.ico`));
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
/**
 * 启用flash
 */
function startFlash() {
  //启用flash
  const pepflashplayer = process.arch == 'x64' ? `${staticPath}resources/flash/pepflashplayer64_32_0_0_363.dll` : `${staticPath}resources/flash/pepflashplayer32_32_0_0_363.dll`;
  //设定插件
  app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pepflashplayer));
  //设定插件版本（不知道是否真有用，不匹配貌似也能运行）
  app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.363');
}
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.show();
    }
  });
  //启用flash
  startFlash();
  //应用初始
  app.whenReady().then(() => {
    createWindow();
    createAppTray();
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
  //事件监听-最小化
  ipcMain.on('web-minimize', (event, arg) => {
    mainWindow.minimize();
  });
  //事件监听-退出
  ipcMain.on('web-quit', (event, arg) => {
    app.quit();
    mainWindow = null;
  });
  //事件监听-控制台
  ipcMain.on('open-dev-tools', (event, arg) => {
    mainWindow.webContents.openDevTools();
  });
}
