const fs = require("fs").promises
const { prompt, operators } = require("./utils")

const log = (...args) => console.log(`[microSQL] ${args.join(' ')}`)