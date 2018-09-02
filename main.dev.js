// Modules to control application life and create native browser window
const { app, Menu, Tray, BrowserWindow, nativeImage } = require('electron')

const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let tray, menu
let mainWindow, loadingWindow

// Auto add referer to the headers.
const Referer = 'https://www.pixiv.net/'
const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/logo.ico'))

async function initialization() {
  tray = new Tray(icon)
  tray.setToolTip('PxScope')

  menu = Menu.buildFromTemplate([
    {
      label: 'PxScope'
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

// Create main window.
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    minWidth: 600,
    minHeight: 400,
    icon: icon,
    show: false,
    frame: false,
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.dev.html'))

  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((detail, callback) => {
    Object.assign(detail.requestHeaders, { Referer })
    callback(detail)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async function() {
  loadingWindow = new BrowserWindow({
    width: 384,
    height: 384,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    icon: icon,
  })

  loadingWindow.loadFile(path.join(__dirname, 'loading.html'))

  await initialization()

  createMainWindow()

  mainWindow.on('ready-to-show', () => {
    loadingWindow.destroy()
    mainWindow.show()

    // This bug has been fixed by windows update KB4340917.
    // https://github.com/electron/electron/issues/12971#issuecomment-403956396
    mainWindow.on("unmaximize", () => {
      if (process.platform === "win32") {
        setTimeout(() => {
          const bounds = mainWindow.getBounds()
          bounds.width += 1
          mainWindow.setBounds(bounds)
          bounds.width -= 1
          mainWindow.setBounds(bounds)
        }, 5)
      }
    })
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


