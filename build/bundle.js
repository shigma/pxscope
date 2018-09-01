const webpack = require('webpack')
const util = require('./util')

if (util.flag('init')) require('./transpile')
if (process.env.TRAVIS === 'true') console.log()

util.start()
const ROOT = util.resolve()

const compiler = webpack({
  mode: util.flag('dev') ? 'development' : 'production',
  target: 'electron-renderer',
  entry: util.resolve('temp/app.vue.js'),
  output: {
    libraryTarget: 'commonjs2',
    path: util.resolve('dist'),
    filename: 'app.js',
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.runtime.common',
    }
  },
})

new webpack.ProgressPlugin(process.env.TRAVIS === 'true' ? {
  handler(progress, message, ...details) {
    const percentage = (Math.floor(progress * 1000) / 10).toFixed(1)
    message = percentage + '% ' + message
    if (progress < 1) message = ' ' + message
    if (progress < .1) message = ' ' + message
    details.forEach((detail) => {
      if (!detail) return
      if (detail.startsWith(ROOT)) detail = detail.slice(ROOT.length)
      message += ' ' + detail
    })
    console.log(message)
  }
} : {}).apply(compiler)

compiler.run((error, stats) => {
  if (error) {
    console.error(error.stack || error)
    if (error.details) {
      console.error(error.details)
    }
    process.exit(1)
  }

  const info = stats.toJson()

  if (stats.hasErrors()) {
    console.error(info.errors)
    process.exit(1)
  }

  if (stats.hasWarnings()) {
    console.log(info.warnings.join(''))
  }

  console.log('Bundle Succeed.', util.time())
})
