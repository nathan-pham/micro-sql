const fs = require("fs").promises
const { log } = require("./utils")

let db = {}
let default_db = "microsql.db"


module.exports.load = async (file=default_db) => {
    try {
        db = JSON.parse(await fs.readFile(file))
    } catch(e) {
        log(file, "does not exists, creating new database")
        await fs.writeFile(file, "{}")
    }
}

module.exports.commit = async (file=default_db) => {
    await fs.writeFile(file, JSON.stringify(db))
}

module.exports.get_table = (table_name, cols) => (
    cols.includes("*")
        ? db[table_name]
        : (
            db[table_name].map(item => (
                Object.keys(item).reduce((acc, cur) => ({
                    ...acc,
                    [cur]: cols.includes(cur) ? item[cur] : undefined
                }), {})
            ))   
        )
)

module.exports.log = () => log(JSON.stringify(db, null, 2))
module.exports.create_table = (table_name) => db[table_name] = []
module.exports.delete_table = (table_name) => delete db[table_name]