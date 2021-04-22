const readline = require("readline")
const fs = require("fs").promises

const prompt = (question) => (
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

const log = (...args) => (
  console.log(`[microSQL] ${args.join(' ')}`)
)

const operators = {
  "=": (a, b) => a == b,
  ">": (a, b) => Number(a) > Number(b),
  "<": (a, b) => Number(a) < Number(b),
  ">=": (a, b) => Number(a) >= Number(b),
  "<=": (a, b) => Number(a) <= Number(b),
}

const printHelp = () => (
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
)

const commitDatabase = (file, db) => (
  fs.writeFile(file, JSON.stringify(db))
)

const getDataFromTable = (cols, table) => {
  if(cols == '*') {
    return table
  }

  cols = cols.split(", ")
  return table.map(part => {
    const keys = Object.keys(part)
    return keys.reduce((acc, cur) => cols.includes(cur)
      ? { ...acc, [cur]: part[cur] }
      : acc
    , {})
  })
}

const expect = (clause, expected) => {
  if(expected.includes(clause)) {
    return true
  } else {
   log(`unexpected token "${clause}" did you mean "${expected.filter(v => v.charAt(0) == clause.charAt(0))[0] || expected[0]}"?`) 
   return false
  }
}

const parseLiteral = (token) => (
  isNaN(token)
    ? token
    : parseFloat(token)
)

const main = async (file="microSQL.json") => {
  let db = {}

  try {
    db = JSON.parse(await fs.readFile(file))
  } catch(e) {
    log(file, "does not exist, creating new database")
    await fs.writeFile(file, "{}")
  }

  repl:
  while(true) {
    const query = await prompt("> ")
    const [command, ...parameters] = query.split(' ')
      .map(v => v.trim())
      .filter(v => v.length)

    switch(command) {
      case ".exit":
        break repl

      case ".help": 
        printHelp()
        break

      case "select": {
        const [cols, _from, tableName, ...rest] = parameters


        if(!expect(_from, ["from"])) {
          continue
        }

        if(!db.hasOwnProperty(tableName)) {
          log(file, `does not have table "${tableName}", did you mean to create it instead?`)
          continue
        }

        let data = getDataFromTable(cols, db[tableName])

        if(rest.length) {
          let [_filter, lhs, op, ...rhs] = rest
          
          rhs = rhs.join(' ')

          if(!expect(_filter, ["where"]) || !expect(op, Object.keys(operators))) {
            continue
          }

          if(_filter == "where") {
            if(cols.includes(lhs) || cols == '*') {
              data = data.filter(part => {
                const l = operators[op](parseLiteral(part[lhs]), parseLiteral(rhs))
                console.log(parseLiteral(part[lhs]), lhs, "LHS")
                console.log(parseLiteral(part[rhs]), rhs, "RHS")
                console.log(l, "L", part, "PART")
                return l
              })
            }
          }
        } 

        log(JSON.stringify(data, null, 2))
        break
      }

      default:
        continue
    }

    commitDatabase(file, db)
  }

}

main()

/*
      if rest:
        filter_cmd, *rest = rest
        printd("filter =", filter_cmd)

        if filter_cmd == "where":
          lhs, op, rhs = rest
          if lhs in cols:
            data = { e for e in data if op_map[op](e[lhs], parse_literal(rhs)) }
            print_table(data)
      else:
        print_table(data)
    elif cmd == "insert":
      _into, table_name, *rest = ' '.join(rest).split()
      printd("table =", table_name, rest)

      cols, row_data = ' '.join(rest).split(" values ")
      cols = parse_csv(cols[1:-1])
      row_data = parse_csv(row_data[1:-1])
      row_data = list(map(parse_literal, row_data))
      data = dict(zip(cols, row_data))
      printd("data =", data)

      insert_row_into_table(table_name, data)
    elif cmd == "delete":
      _from, table_name, *rest = ' '.join(rest).split()
      printd("table =", table_name)
      print(rest)
      filter_cmd, *rest = rest
      printd("filter =", filter_cmd)

      if filter_cmd == "where":
        lhs, op, rhs = rest
        delete_row_from_table(table_name, op_map[op], lhs, parse_literal(rhs))
    elif cmd == "create":
      _table, table_name, *rest = ' '.join(rest).split()
      printd("table =", table_name)

      cols = parse_csv(' '.join(rest)[1:-1])
      printd("cols =", cols)

      create_table(table_name, cols)
    elif cmd == "drop":
      _table, table_name = ' '.join(rest).split()
      printd("table =", table_name)

      delete_table(table_name)

    persist_to_db()


def get_data_from_table(table_name, cols):
  """
  cols is a list of column names
  """
  return [{ k : d[k] for k in cols } for d in db[table_name]]


def insert_row_into_table(table_name, data):
  """
  data is a list of col and row_datum
  """
  db[table_name].append(data)


def delete_row_from_table(table_name, f, lhs, rhs):
  d = 0
  for row in db[table_name]:
    if f(row[lhs], rhs):
      db[table_name].remove(row)
      d += 1
  print("Deleted %d rows" % d)


def create_table(table_name, cols):
  """
  cols is a list of column names
  """
  db[table_name] = []


def delete_table(table_name):
  del db[table_name]


def load_from_db():
  global db
  try:
    with open('microsql.db', 'rb') as db_file:
      db = pickle.load(db_file)
  except FileNotFoundError:
    pass


def persist_to_db():
  with open('microsql.db', 'wb') as db_file:
    pickle.dump(db, db_file)


def parse_csv(csv):
  return csv.replace(' ', '').split(',')

  


def print_table(dataset):
  keys = []
  vals = []
  for data in dataset:
      val = []
      for k,v in data.items():
          keys.append(k)
          val.append(v)
      vals.append(val)

  header = '\t'.join(dict.fromkeys(keys))
  print(' ', header)
  print('-' * (len(str(header)) + 2))
  for i, v in enumerate(vals):
      print(i+1, '\t'.join(map(str, v)))


def printd(*args):
  if DEBUG:
    print(*args)


def print_help():
  print("""
  microSQL is a simple ever SQL DB.

  Supported SQL Syntax:
    select cols, ... from table_name [where ...]
    insert into table_name (cols, ...) values (v, ...)
    delete from table_name [where ...]
    create table table_name (cols, ...)
    drop table table_name

  Available commands:
    .showdb      Prints the DB
    .help        Prints this help menu and exits
    .exit        Exits the REPL
  """)

if __name__ == "__main__":
  main()
 */