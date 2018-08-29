const webpack = require('webpack')
const path = require('path')

const compiler = webpack({
  target: 'electron-renderer',
  entry: path.resolve(__dirname, '../dist/app.vue'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'app.dist.js'
  },
})

new webpack.ProgressPlugin().apply(compiler)

compiler.run((error, stat) => {
  if (error) {
    console.error(error)
  } else if (stat.compilation.errors.length) {
    console.error(stat.compilation.errors.join('\n'))
  } else {
    console.log('Bundle Succeed.')
  }
})