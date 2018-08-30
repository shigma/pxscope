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
  constructor(major, minor, patch) {
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
}

module.exports = {
  exec,
  version(branch) {
    const data = JSON.parse(exec(`git show ${branch}:package.json`, false))
    return new Version(...data.version.match(/^(\d+)\.(\d+)\.(\d+)$/).slice(1))
  }
}