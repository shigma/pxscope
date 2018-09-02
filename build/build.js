const util = require('./util')
const fs = require('fs')

!async function() {
  util.start()
  if (process.env.TRAVIS === 'true') console.log()
  
  if (util.flag('init')) {
    util.mkdir('dist')
    util.mkdir('temp')
    util.mkdir('pack')
    util.mkdir('logs')
    util.clone('main.dev.js', 'main.js')
    util.clone('node_modules/vue/dist/vue.runtime.min.js', 'dist/vue.js')
    util.clone('node_modules/element-ui/lib/index.js', 'dist/element-ui.js')
    util.clone('node_modules/element-ui/lib/theme-chalk/fonts', 'dist/fonts')
    util.clone('node_modules/element-ui/lib/theme-chalk/index.css', 'dist/element-ui.css')
    console.log('Build: App structure has been initialized.')
  }
  
  if (util.flag('tsc')) {
    util.exec('tsc', { show: false })
    console.log('Build: Typescript files have been compiled.')
  }
  
  if (util.flag('hosts')) {
    const { Hosts } = require('../pixiv/dist/hosts')
    return new Hosts({
      save(data) {
        fs.writeFileSync(util.resolve('temp/hosts.json'), JSON.stringify(data))
        console.log('Build: Hosts file has been generated.\n')
        const serverNames = Object.keys(data)
        const maxLength = Math.max(...serverNames.map(name => name.length)) + 1
        serverNames.forEach((serverName) => {
          console.log(`${(serverName + ':').padEnd(maxLength)} ${data[serverName]}`)
        })
        console.log()
      }
    }).update()
  }
}().then(() => {
  console.log('Build Succeed.', util.time())
}, (error) => {
  console.error(error)
  process.exit(1)
})

