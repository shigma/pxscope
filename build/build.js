const cp = require('child_process')
const fs = require('fs')
const util = require('./util')

if (process.env.TRAVIS === 'true') console.log()

util.mkdir('dist')
util.mkdir('pack')
util.mkdir('logs')

function clone(src, dest) {
  fs.copyFileSync(util.resolve(src), util.resolve(dest))
}

clone('build/main.dev.js', 'main.js')

cp.exec('tsc', async (error) => {
  if (error) {
    console.error(error)
    process.exit(1)
  }
  console.log('Build: Typescript files were successfully compiled.')
  try {
    await require('../pixiv/dist/hosts').Hosts.update()
    console.log('Build: Hosts can be successfully generated.')
    console.log('Build Succeed.')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})
