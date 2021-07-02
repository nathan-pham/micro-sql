const readline = require("readline")

const DEBUG = true

module.exports.log = (...args) => {
  if(DEBUG) {
    console.log(`[microSQL] ${args.join(' ')}`)
  }
}

module.exports.prompt = (question) => (
  new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
)

module.exports.operators = {
  "=": (a, b) => a == b,
  ">": (a, b) => Number(a) > Number(b),
  "<": (a, b) => Number(a) < Number(b),
  ">=": (a, b) => Number(a) >= Number(b),
  "<=": (a, b) => Number(a) <= Number(b),
}