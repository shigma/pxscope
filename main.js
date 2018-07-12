// Modules to control application life and create native browser window
const {app, Menu, Tray, BrowserWindow, nativeImage, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let tray, menu
let mainWindow, loadingWindow

const icon = nativeImage.createFromPath(path.resolve(__dirname, 'assets/icon.ico'))

async function initialization() {
  tray = new Tray(icon)
  tray.setToolTip('Pxer桌面版')

  menu = Menu.buildFromTemplate([
    {
      label: 'Pxer桌面版'
    },
    {
      type: 'separator'
    },
    {
      label: '开发者工具',
      click: () => {
        if (mainWindow.webContents.isDevToolsOpened()) {
          mainWindow.webContents.closeDevTools()
        } else {
          mainWindow.webContents.openDevTools()
        }
      }
    },
    {
      label: '退出',
      role: 'quit'
    }
  ])

  tray.setContextMenu(menu)
  tray.on('click', () => mainWindow.show())

  // Only for test
  // return new Promise(resolve => {
  //   setTimeout(() => resolve(20), 2000)
  // })
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    icon: icon,
    show: false
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async function() {
  loadingWindow = new BrowserWindow({
    width: 350,
    height: 350,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    icon: icon
  })

  loadingWindow.loadFile('loading.html')

  await initialization()

  createMainWindow()

  mainWindow.once('connected-to-pixiv', () => {
    loadingWindow.destroy()
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    // Closed unshowed windows too.
    for (let i = pixivWindows.length - 1; i >= 0; i--) {
      pixivWindows[i].destroy()
      pixivWindows.splice(i, 1)
    }
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow()
  }
})

let PXER_ENV

// This method will be called when render process is started.
ipcMain.on('start', (event, env) => {
  // Currently no use.
  PXER_ENV = env
})

// All these render processes are not showed by default.
const pixivWindows = []

// Called by interprocess communication
ipcMain.on('load', (event, url, selector) => {
  const window = new BrowserWindow({show: false})
  const content = window.webContents
  const id = window.id

  window.loadURL(url)
  
  const loader = fs.readFileSync(__dirname.replace(/\\/g, '/') + '/loader.js', {encoding: 'utf8'})

  // Dom-ready is the perfect time for grabbing.
  content.on('dom-ready', () => {
    content.executeJavaScript(`${loader}('${selector}')`).then(result => {
      mainWindow.emit('connected-to-pixiv')
      if (!result) {
        // Not logged in.
        window.show()
        mainWindow.hide()
      } else {
        // Send back result.
        event.sender.send('loaded', result)
      }
    })
  })

  content.on('will-navigate', (event, newUrl) => {
    if (newUrl === url) {
      // Navigate into required page.
      window.hide()
      mainWindow.show()
    }
  })

  // Remove reference.
  window.on('closed', () => {
    const index = pixivWindows.findIndex(win => win.id === id)
    if (index >= 0) pixivWindows.splice(index, 1)
  })
})