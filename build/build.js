const sass = require('sass')
const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..')
let imports = ''

// Make directory if it not exists.
if (!fs.existsSync(ROOT + '/dist')) fs.mkdirSync(ROOT + '/dist')
if (!fs.existsSync(ROOT + '/logs')) fs.mkdirSync(ROOT + '/logs')

// Transcode scss files into css files.
function transcode(filenames, formatter = code => code, wrapper = name => name) {
  filenames.forEach((filename) => {
    const filepath = ROOT + wrapper(filename)
    if (!fs.existsSync(filepath + '.scss')) return
    const source = fs.readFileSync(filepath + '.scss', {encoding: 'utf8'})
    const {css} = sass.renderSync({
      data: formatter(source, filename),
      outputStyle: 'compressed'
    })
    fs.writeFileSync(filepath + '.css', css)
    imports += `@import"${wrapper(filename).slice(1)}.css";`
  })
}

// Traverse all components.
function walk(dirname) {
  const dirpath = ROOT + dirname
  if (!fs.statSync(dirpath).isDirectory()) return []
  return [dirname].concat(...fs.readdirSync(dirpath).map(subdir => walk(`${dirname}/${subdir}`)))
}

transcode(walk('/comp'),
  (code, comp) => `.${comp.match(/[\w-]+$/)[0]}{${code}}`,
  (filename) => `${filename}/index`,
)

transcode(require('../themes'),
  (code, theme) => `.${theme}{${code}}`,
  (filename) => `/themes/${filename}`,
)

transcode(['/app'], code => imports + code)
