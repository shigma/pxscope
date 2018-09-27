const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let mainWindow, loadingWindow

const tasks = []
const settings = {}
const Referer = 'https://www.pixiv.net/'

function randomID() {
  return Math.floor(Math.random() * 36 ** 6).toString(36).padStart(6, '0')
}

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

  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  mainWindow.on('closed', () => mainWindow = null)

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((detail, callback) => {
    Object.assign(detail.requestHeaders, { Referer })
    callback(detail)
  })
  
  ipcMain.on('initiate', (event, storage) => {
    Object.assign(settings, storage)
  })

  ipcMain.on('setting', (event, key, value) => {
    settings[key] = value
    event.sender.send('emm', value)
  })

  ipcMain.on('download', (event, url, savePath) => {
    if (tasks.find(task => task.url === url)) return
    const task = { id: randomID(), url }
    if (savePath) {
      if (!path.extname(savePath)) savePath += path.extname(url)
      task.path = path.resolve(settings.path, 'illusts', savePath)
    } else {
      task.path = path.resolve(settings.path, 'illusts', path.basename(url))
    }
    tasks.push(task)
    mainWindow.webContents.downloadURL(url)
  })

  ipcMain.on('pause', (event, id) => {
    const task = tasks.find(task => task.id === id)
    if (task && task.item) task.item.pause()
  })
  
  ipcMain.on('resume', (event, id) => {
    const task = tasks.find(task => task.id === id)
    if (task && task.item) task.item.resume()
  })
  
  ipcMain.on('cancel', (event, id) => {
    const task = tasks.find(task => task.id === id)
    if (task && task.item) task.item.cancel()
  })
  
  mainWindow.webContents.session.on('will-download', (event, item) => {
    const url = item.getURL()
    const task = tasks.find(task => task.url === url)

    if (!task) event.preventDefault()
    if (task.path) item.setSavePath(task.path)
    task.size = item.getTotalBytes()
    task.birth = item.getStartTime()
    task.item = item

    mainWindow.webContents.send('dl-started', task)
  
    item.on('updated', (event, state) => {
      task.state = state
      if (!task.path) task.path = item.getSavePath()
      if (state === 'interrupted') {
        mainWindow.webContents.send('dl-interrupted', task)
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          mainWindow.webContents.send('dl-paused', task)
        } else {
          task.bytes = item.getReceivedBytes()
          mainWindow.webContents.send('dl-updated', task)
        }
      }
    })

    item.once('done', (event, state) => {
      task.state = state
      if (state === 'completed') {
        mainWindow.webContents.send('dl-completed', task)
      } else {
        mainWindow.webContents.send('dl-failed', task)
      }
      const index = tasks.findIndex(({ id }) => id === task.id)
      if (index >= 0) tasks.splice(index, 1)
    })
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


