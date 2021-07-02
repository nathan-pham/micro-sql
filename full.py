import pickle

DEBUG = not True

db = dict()

op_map = {'=': (lambda a, b: a == b),
          '>': (lambda a, b: int(a) > int(b)),
          '<': (lambda a, b: int(a) < int(b)),
          '>=': (lambda a, b: int(a) >= int(b)),
          '<=': (lambda a, b: int(a) <= int(b))}

def main():
  load_from_db()

  while True:
    qs = input(">")

    if not qs or qs == ".exit":
      break

    if qs == ".help":
      print_help()
      break

    if qs == ".showdb":
      print(db)
      continue

    cmd, *rest = qs.split()

    printd("cmd =", cmd)

    if cmd == "select":
      cols, rest = ' '.join(rest).split(' from ')

      cols = parse_csv(cols)
      printd("cols =", cols)

      table_name, *rest = rest.split()
      printd("table =", table_name)

      data = get_data_from_table(table_name, cols)

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