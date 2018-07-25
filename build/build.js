const sass = require('sass')
const path = require('path')
const fs = require('fs')

;[
  'app'
].forEach(filename => {
  const filepath = path.join(__dirname, '..', filename)
  fs.writeFileSync(
    filepath + '.css',
    sass.renderSync({
      file: filepath + '.scss',
      outputStyle: 'compressed',
    }).css.toString(),
    {encoding: 'utf8'}
  )
})
