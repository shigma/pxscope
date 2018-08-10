const fs = require('fs')
fs.writeFileSync(__dirname + '/index.json', JSON.stringify(
  new (require('../hosts'))(fs.readFileSync(__dirname + '/hosts'))
))