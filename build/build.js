const path = require('path')
const fs = require('fs')

require('../pixiv/data/build')

fs.copyFileSync(
  path.join(__dirname, 'main.dev.js'),
  path.join(__dirname, '../main.js')
)
