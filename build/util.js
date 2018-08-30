const cp = require('child_process')

function exec(command, show = true) {
  try {
    if (show) console.log(`$ ${command}`)
    const result = cp.execSync(command).toString('utf8')
    if (show) console.log(result)
    return result
  } catch ({ message }) {
    console.log(message)
    process.exit(1)
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
    return new Version(JSON.parse(exec(`git show ${branch}:package.json`, false)).version)
  }
}

module.exports = {
  exec,
  Version,
}