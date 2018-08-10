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

compiler.run(error => console.log(error))