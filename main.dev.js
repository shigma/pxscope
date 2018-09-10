// Modules to control application life and create native browser window
const { app, Menu, Tray, BrowserWindow, nativeImage, ipcMain } = require('electron')

const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

/** @type {Tray} */
let tray

/** @type {Menu} */
let menu

/** @type {BrowserWindow} */
let mainWindow

/** @type {BrowserWindow} */
let loadingWindow

/** Download tasks. */
const tasks = []

/**
 * Generate a random hex id.
 * @returns {string} Generated ID
 */
function randomID() {
  return Math.floor(Math.random() * 36 ** 6).toString(36)
}

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

  // Interprocess communications.
  ipcMain.on('download', (event, url, savePath) => {
    // currently forbid downloading from same url
    if (tasks.find(task => task.url === url)) return
    const task = { id: randomID(), url }
    if (savePath) task.path = path.resolve(savePath)
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
  
  // Handle downloading events.
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
      // Remove task after done
      const index = tasks.findIndex(({ id }) => id === task.id)
      if (index >= 0) tasks.splice(index, 1)
    })
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
