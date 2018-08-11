const {app, BrowserWindow} = require('electron')

let mainWindow

const Referer = 'https://www.pixiv.net/'

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

  mainWindow.loadFile('index.prod.html')

  mainWindow.on('closed', () => mainWindow = null)

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((detail, callback) => {
    Object.assign(detail.requestHeaders, { Referer })
    callback(detail)
  })
}

app.on('ready', async function() {
  createMainWindow()

  mainWindow.on('ready-to-show', () => {
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


