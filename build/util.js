const cp = require('child_process')
const path = require('path')
const fs = require('fs')

class Version {
  constructor(source) {
    const [, major, minor, patch ] = source.match(/^(\d+)\.(\d+)\.(\d+)$/)
    this.major = Number(major)
    this.minor = Number(minor)
    this.patch = Number(patch)
  }

  toString() {
    return `${this.major}.${this.minor}.${this.patch}`
  }

  get tag() {
    return `v${this.major}.${this.minor}`
  }

  static from(branch) {
    return new Version(JSON.parse(exec(`git show ${branch}:package.json`, { show: false })).version)
  }
}

function exec(command, { show = true, exit = true } = {}) {
  if (command instanceof Array) {
    return command.map(command => exec(command, { show, exit }))
  }

  try {
    if (show) console.log(`$ ${command}`)
    const result = cp.execSync(command).toString('utf8')
    if (show) console.log(result)
    return result
  } catch (error) {
    console.log(error.message)
    if (exit) {
      process.exit(1)
    } else {
      throw error
    }
  }
}

function resolve(...name) {
  return name.length && path.isAbsolute(name[0])
    ? path.join(...name)
    : path.join(__dirname, '..', ...name)
}

function mkdir(name) {
  const fullPath = resolve(name)
  fs.existsSync(fullPath) || fs.mkdirSync(fullPath)
}

function clone(src, dest) {
  fs.copyFileSync(resolve(src), resolve(dest))
}

function flag(string) {
  return process.argv.includes(`--${string}`)
}

function walk(base, { onDir = () => {}, onFile = () => {} }) {
  function walker(base) {
    const absPath = resolve(base)
    const stat = fs.statSync(absPath)
    if (stat.isFile()) {
      return onFile(base, stat)
    } else {
      const files = fs.readdirSync(absPath).map(name => `${base}/${name}`)
      return onDir(base, files, (base) => walker(base, onDir, onFile))
    }
  }
  return walker(base)
}

function getSize(base) {
  return walk(base, {
    onFile(_, stat) {
      return stat.size
    },
    onDir(_, files, callback) {
      return files.reduce((total, file) => total + callback(file), 0)
    }
  })
}

module.exports = {
  Version,
  exec,
  resolve,
  mkdir,
  clone,
  flag,
  walk,
  getSize,
}