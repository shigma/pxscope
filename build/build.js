const sass = require('sass')
const path = require('path')
const fs = require('fs')

function transcode(filenames, directory = '', wrapper = code => code) {
  filenames.forEach(filename => {
    const filepath = path.join(__dirname, '..', directory, filename)
    const source = fs.readFileSync(filepath + '.scss', {encoding: 'utf8'})
    const css = sass.renderSync({
      data: wrapper(source, filename),
      outputStyle: 'compressed'
    }).css
    fs.writeFileSync(filepath + '.css', css)
  })
}

transcode(['app'])

transcode(['night', 'simple'], 'themes', (code, theme) => {
  return `.${theme}{${code}}`
})
