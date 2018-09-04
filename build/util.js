const cp = require('child_process')
const path = require('path')
const fs = require('fs')

class Version {
  constructor(source) {
    const [, major, minor, patch] = source.match(/^(\d+)\.(\d+)\.(\d+)$/)
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

function flag(string) {
  return process.argv.includes(`--${string}`)
}

function resolve(...name) {
  name = path.join(...name)
  return path.isAbsolute(name)
    ? path.join(name)
    : path.join(__dirname, '..', name)
}

function mkdir(name) {
  const full = resolve(name)
  fs.existsSync(full) || fs.mkdirSync(full)
}

function walk(base, { onDir = () => {}, onFile = () => {} }) {
  function traverse(name) {
    const full = resolve(name)
    const stat = fs.statSync(full)
    if (stat.isFile()) {
      return onFile(name, full, stat)
    } else {
      const files = fs.readdirSync(full).map(sub => `${name}/${sub}`)
      return onDir(name, full, files, traverse)
    }
  }
  return traverse(base)
}

function clone(src, dest) {
  const srcFull = resolve(src)
  const destFull = resolve(dest)
  return walk(src, {
    onFile(name, full) {
      fs.copyFileSync(full, destFull + full.slice(srcFull.length))
    },
    onDir(name, full, files, callback) {
      mkdir(destFull + full.slice(srcFull.length))
      files.forEach(callback)
    }
  })
}

function remove(base) {
  if (!fs.existsSync(resolve(base))) return
  return walk(base, {
    onFile(name, full) {
      fs.unlinkSync(full)
    },
    onDir(name, full, files, callback) {
      files.forEach(callback)
      fs.rmdirSync(full)
    }
  })
}

function getSize(base) {
  return walk(base, {
    onFile(name, full, stat) {
      return stat.size
    },
    onDir(name, full, files, callback) {
      return files.reduce((total, file) => total + callback(file), 0)
    }
  })
}

const timers = {}

function start(label = '') {
  if (!timers[label]) timers[label] = { total: 0 }
  timers[label].start = Date.now()
  return time(label)
}

function pause(label = '') {
  timers[label].total += Date.now() - timers[label].start
  timers[label].start = Date.now()
  return time(label)
}

function finish(label = '') {
  pause(label)
  const result = time(label)
  timers[label].total = 0
  return `Finished in ${result.toFixed(1)}s.`
}

function time(label = '') {
  return timers[label].total / 1000
}

function percent(n) {
  return (n * 100).toFixed(1) + '%'
}

module.exports = {
  Version,
  exec,
  resolve,
  mkdir,
  clone,
  flag,
  walk,
  remove,
  getSize,
  start,
  pause,
  finish,
  time,
  percent,
}