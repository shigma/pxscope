const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')

exec('tsc', async (error) => {
  if (error) {
    console.error(error)
  } else {
    try {
      await require('../pixiv/dist/hosts').Hosts.update()
      fs.copyFileSync(
        path.join(__dirname, 'main.dev.js'),
        path.join(__dirname, '../main.js')
      )
      console.log('Build Succeed.')
    } catch (error) {
      console.error(error)
    }
  }
})
