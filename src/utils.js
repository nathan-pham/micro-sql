const readline = require("readline")

const SUPPRESS = false

module.exports.log = (...args) => {
  if(!SUPPRESS) {
    console.log(`[microSQL] ${args.join(' ')}`)
  }
}

module.exports.log_help = () => {
console.log(`microSQL, a simple SQL DB

Supported Sntax:
  select cols, ... from table_name [where ...]
  insert into table_name (cols, ...) values (v, ...)
  delete from table_name [where ...]
  create table table_name (cols, ...)
  drop table table_name

Available Commands:
  .showdb      Prints the DB
  .help        Prints this help menu and exits
  .exit        Exits the REPL`)
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