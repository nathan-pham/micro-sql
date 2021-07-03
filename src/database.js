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

const log_table = (table) => {
    let keys = []
    let vals = []

    for(const item of table) {
        vals.push(Object.values(item))
        keys.push(Object.keys(item))
    }

    keys = [...new Set(keys.flat(Infinity))]

    let header = keys.join("\t")
    let divider = new Array(header.length + keys.length * 4).fill('-').join('')
    console.log(" ", header)
    console.log(divider)

    for(let i = 0; i < vals.length; i++) {
        console.log(i + 1, vals[i].join("\t"))
    }
}

module.exports.log = () => {
    for(const [table_name, table_values] of Object.entries(db)) {
        console.log(`  [${table_name}]`)
        log_table(table_values)
        console.log()
    }
}
module.exports.log_table = log_table

module.exports.create_table = (table_name) => db[table_name] = []
module.exports.delete_table = (table_name) => delete db[table_name]

module.exports.insert_row = (table_name, data) => db[table_name].push(data)
module.exports.delete_row = (table_name, f, lhs, rhs) => {
    let i = 0

    db[table_name] = db[table_name].filter(item => {
        let to_delete = !f(item[lhs], rhs)
        if(to_delete) { i++ }
        return to_delete
    })

    log("deleted", i, "rows")
}