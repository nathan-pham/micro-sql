const utils = require("./src/utils")
const parse = require("./src/parse")
const database = require("./src/database")

const repl = async () => {
    database.load()

    main_repl:
    while(true) {
        let [cmd, ...rest] = parse.query(await utils.prompt("> "))

        switch(cmd) {
            case ".exit": {
                break main_repl
            }
            
            case ".help": {
                utils.log_help()
                break
            }
            
            case ".showdb": { 
                database.log()
                break
            }
            
            case "select": {
                if(!rest.includes("from")) {
                    utils.log("missing from clause")
                    break
                }

                let [cols, ..._rest] = rest.filter(v => v !== "from")
                let table_name = _rest.shift()
                cols = parse.query(cols, ',')

                let data = database.get_table(table_name, cols)

                if(_rest.length) {
                    let filter_cmd = _rest.shift()
                    
                    if(filter_cmd == "where") {
                        let [lhs, op, rhs] = _rest

                        if(cols.includes(lhs) || cols.includes("*")) {
                            data = data.filter(item => (
                                utils.operators[op](item[lhs], parse.literal(rhs))
                            ))
                        }
                    }
                }

                database.log_table(data)
                break
            }

            case "create": {
                let [_table, table_name, ..._rest] = rest
                let cols = parse.query(_rest.join(' ').slice(1, -1), ',')

                database.create_table(table_name, cols)
                break
            }

            case "drop": {
                let [_table, table_name] = rest
                database.delete_table(table_name)
                break
            }

            default: break
        }

        database.commit()
    }
}

repl()

/**
todo: new microsql format
todo: encrypt file
todo: db class, muliple databases
{
    filename: "microsql.db",
    table_schema: {
        Username: ["username:str", "password:int"]
    }
    tables: {

    }
}
*/