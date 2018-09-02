const cleanCSS = new (require('clean-css'))({ level: 2 })
const webpack = require('webpack')
const util = require('./util')
const fs = require('fs')

if (util.flag('init')) require('./transpile')
if (process.env.TRAVIS === 'true') console.log()

util.start()
const ROOT = util.resolve()

if (util.flag('css')) {
  function minify(name) {
    const result = cleanCSS.minify(fs.readFileSync(util.resolve(name)))
    if (result.errors.length) {
      console.log(result.errors.join('\n'))
      process.exit(1)
    } else {
      return result.styles
    }
  }
  fs.writeFileSync(util.resolve('dist/index.css'),
    fs.readFileSync(util.resolve('assets/icons.css')) +
    minify('comp/index.css') +
    minify('temp/app.css')
  )
  console.log('Bundle: CSS files have been bundled.')
}

if (!util.flag('dev') && !util.flag('prod')) {
  console.log('Bundle Succeed.', util.time())
  process.exit(0)
}

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
    console.error(info.errors.join(''))
    process.exit(1)
  }

  if (stats.hasWarnings()) {
    console.log(info.warnings.join(''))
  }

  console.log('Bundle: JS files have been bundled.')
  console.log('Bundle Succeed.', util.time())
})
