const fs = require("fs").promises
const { log } = require("./utils")

let db = {}
let default_db = "microsql.db"

module.exports.load_db = async (file=default_db) => {
    try {
        db = JSON.parse(await fs.readFile(file))
    } catch(e) {
        log(file, "does not exists, creating new database")
        await fs.writeFile(file, "{}")
    }
}

module.exports.persist_db = async (file=default_db) => {
    await fs.writeFile(file, JSON.stringify(db))
}