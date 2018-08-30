const cp = require('child_process')
const path = require('path')
const fs = require('fs')

if (process.env.TRAVIS === 'true') console.log()

cp.exec('tsc', async (error) => {
  if (error) {
    console.error(error)
    process.exit(1)
  }
  console.log('Build: Typescript files were successfully compiled.')
  try {
    await require('../pixiv/dist/hosts').Hosts.update()
    console.log('Build: Hosts were successfully generated.')
    fs.copyFileSync(
      path.join(__dirname, 'main.dev.js'),
      path.join(__dirname, '../main.js')
    )
    console.log('Build Succeed.')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})
