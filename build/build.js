const sass = require('sass')
const path = require('path')
const fs = require('fs')

if (!fs.existsSync(path.join(__dirname, '../dist'))) {
  fs.mkdirSync(path.join(__dirname, '../dist'))
}
if (!fs.existsSync(path.join(__dirname, '../logs'))) {
  fs.mkdirSync(path.join(__dirname, '../logs'))
}

function transcode(filenames = [], wrapper = name => name, formatter = code => code) {
  filenames.forEach(filename => {
    const filepath = path.join(__dirname, '..', wrapper(filename))
    const source = fs.readFileSync(filepath + '.scss', {encoding: 'utf8'})
    const css = sass.renderSync({
      data: formatter(source, filename),
      outputStyle: 'compressed'
    }).css
    fs.writeFileSync(filepath + '.css', css)
  })
}

transcode(['app'])

transcode(['night', 'simple'],
  (filename) => `themes/${filename}`,
  (code, theme) => `.${theme}{${code}}`
)

transcode(['user', 'homepage', 'settings', 'user/login'],
  (filename) => `comp/${filename}/index`,
  (code, comp) => `.${comp.replace(/\//g, '-')}{${code}}`
)
