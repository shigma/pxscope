const {remote, ipcRenderer} = require('electron')

// Interprocess communication for envireonment
ipcRenderer.send('start')
ipcRenderer.on('set-env', (_, env) => {
  global.PXER_ENV = env
})

console.log('Hello world')
