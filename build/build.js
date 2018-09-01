const util = require('./util')

!async function() {
  util.start()
  if (process.env.TRAVIS === 'true') console.log()
  
  if (util.flag('init') || util.flag('all')) {
    util.mkdir('dist')
    util.mkdir('temp')
    util.mkdir('pack')
    util.mkdir('logs')
    util.mkdir('dist/fonts')
    util.clone('main.dev.js', 'main.js')
    util.clone('node_modules/vue/dist/vue.runtime.common.js', 'dist/vue.js')
    util.clone('node_modules/element-ui/lib/theme-chalk/fonts', 'dist/fonts')
    util.clone('node_modules/element-ui/lib/theme-chalk/index.css', 'dist/el-index.css')
    util.clone('node_modules/element-ui/lib/theme-chalk/display.css', 'dist/el-display.css')
    console.log('Build: App structure has been initialized.')
  }
  
  if (util.flag('tsc') || util.flag('all')) {
    util.exec('tsc', { show: false })
    console.log('Build: Typescript files have been compiled.')
  }
  
  if (util.flag('hosts') || util.flag('all')) {
    const { Hosts } = require('../dist/hosts')
    return Hosts.update({ interval: 0 }).then(({data}) => {
      console.log('Build: Hosts file has been generated.\n')
      const serverNames = Object.keys(data)
      const maxLength = Math.max(...serverNames.map(name => name.length)) + 1
      serverNames.forEach((serverName) => {
        console.log(`${(serverName + ':').padEnd(maxLength)} ${data[serverName]}`)
      })
      console.log()
    })
  }
}().then(() => {
  console.log('Build Succeed.', util.time())
}, (error) => {
  console.error(error)
  process.exit(1)
})

