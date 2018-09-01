const webpack = require('webpack')
const util = require('./util')

if (!util.flag('no-tp')) require('./transpile')
if (process.env.TRAVIS === 'true') console.log()

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

new webpack.ProgressPlugin().apply(compiler)

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

  console.log('Bundle Succeed.')
})
