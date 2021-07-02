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

                utils.log(JSON.stringify(data, null, 2))
            }

            default: break
        }
    }
}

repl()