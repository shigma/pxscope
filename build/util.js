const cp = require('child_process')

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

module.exports = {
  exec,
  Version,
}