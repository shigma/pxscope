const { app, Menu, Tray, BrowserWindow, nativeImage } = require('electron')
const path = require('path')

let mainWindow, loadingWindow, tray, menu

const Referer = 'https://www.pixiv.net/'
const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/logo.ico'))

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    minWidth: 600,
    minHeight: 400,
    show: false,
    frame: false,
  })

  mainWindow.loadFile(path.join(__dirname, 'index.prod.html'))

  mainWindow.on('closed', () => mainWindow = null)

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((detail, callback) => {
    Object.assign(detail.requestHeaders, { Referer })
    callback(detail)
  })
}

app.on('ready', async function() {
  loadingWindow = new BrowserWindow({
    width: 384,
    height: 384,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
  })
  
  loadingWindow.loadFile(path.join(__dirname, 'loading.html'))

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
  createMainWindow()

  mainWindow.on('ready-to-show', () => {
    loadingWindow.destroy()
    mainWindow.show()

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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createMainWindow()
})


