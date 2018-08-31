const webpack = require('webpack')
const path = require('path')

require('./transpile')
console.log()

const compiler = webpack({
  mode: 'production',
  target: 'electron-renderer',
  entry: path.join(__dirname, '../dist/app.vue.js'),
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'app.dist.js',
    libraryTarget: 'commonjs2',
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
