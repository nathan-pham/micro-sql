const { operators, prompt, log_help, log } = require("./src/utils")
const { parse_literal, parse_query, parse_csv } = require("./src/parse")
const { load_db, persist_db, log_db, create_table, delete_table } = require("./src/database")

const repl = async () => {
    load_db()

    main_repl:
    while(true) {
        const [cmd, ...rest] = parse_query(await prompt("> "))

        switch(cmd) {
            case ".exit": break main_repl
            
            case ".help": {
                log_help()
                break
            }
            
            case ".showdb": { 
                log_db()
                break
            }
            
            case "select": {

            }

            default: break
        }
    }
}

repl()