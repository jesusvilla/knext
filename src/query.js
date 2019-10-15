const forEach = require('@utils/foreach')

function escapeField (field) {
  return '"' + field.replace(/"/g, '""') + '"'
}

export default class Query {
  constructor (table) {
    this.table = table
    this.fields = []
    this.values = []
    this.type = 'SELECT'
    this.whereFields = []
    this.joinFields = []
    this.params = []
  }

  static escapeField (field) {
    if (field === '*') return field
    const matchedField = field.match(/([a-z0-9]+) as ([a-z0-9]+)/i)
    if (matchedField) {
      return `${escapeField(matchedField[1])} AS ${escapeField(matchedField[2])}`
    } else {
      const matchedFieldPoint = field.match(/([a-z0-9]+)\.([a-z0-9]+)/i)
      if (matchedFieldPoint) {
        return `${escapeField(matchedFieldPoint[1])}.${escapeField(matchedFieldPoint[2])}`
      }
    }
    return escapeField(field)
  }

  from (table) {
    this.table = table
    return this
  }

  select () {
    const escapeFieldAux = this.constructor.escapeField
    forEach(arguments, field => {
      if (field === null || field === void 0) {
        return void 0
      }
      if (typeof field === 'string') {
        this.fields.push(escapeFieldAux(field))
      } else if (Array.isArray(field)) {
        forEach(field, f => {
          this.fields.push(escapeFieldAux(f))
        })
      } else if (typeof field === 'object') {
        forEach(field, (f, as) => {
          this.fields.push(escapeFieldAux(`${f} AS ${as}`))
        })
      }
    })
    return this
  }

  allWhere (type, args) {
    if (args.length === 1 && typeof args[0] === 'function') {
      const newWhere = new Query()
      newWhere.params = this.params
      args[0].call(newWhere)
      this.whereFields.push([type, `(${newWhere.whereString()})`])
    } else {
      const field = args[0]
      let operator, value
      if (args.length === 2) {
        operator = '='
        value = args[1]
      } else if (args.length === 3) {
        operator = args[1]
        value = args[2]
      }

      if (operator) {
        this.params.push(value)
        this.whereFields.push([type, `${this.constructor.escapeField(field)} ${operator} $${this.params.length}`])
      }
    }
  }

  andWhere () {
    this.allWhere('AND', arguments)
    return this
  }

  orWhere () {
    this.allWhere('OR', arguments)
    return this
  }

  whereIn () {
    // TODO: Validate
    this.allWhere('AND', [arguments[0], 'IN', arguments[1]])
  }

  where () {
    return this.andWhere.apply(this, arguments)
  }

  whereNull (field) {
    this.whereFields.push(['AND', `${this.constructor.escapeField(field)} IS NULL`])
    return this
  }

  orWhereNull (field) {
    this.whereFields.push(['OR', `${this.constructor.escapeField(field)} IS NULL`])
    return this
  }

  whereRaw (str) {
    this.whereFields.push(['AND', str])
    return this
  }

  whereString () {
    // Internal
    let str = ''
    if (this.whereFields.length) {
      forEach(this.whereFields, ([type, where], i) => {
        if (i === 0) {
          str += where
        } else {
          str += ` ${type} ${where}`
        }
      })
    }
    return str
  }

  internalJoin (type, table, field1, field2) {
    this.joinFields.push(`${type} JOIN ${this.constructor.escapeField(table)} ON ${this.constructor.escapeField(field1)} = ${this.constructor.escapeField(field2)}`)
  }

  innerJoin (table, field1, field2) {
    this.internalJoin('INNER', table, field1, field2)
    return this
  }

  leftJoin (table, field1, field2) {
    this.internalJoin('LEFT', table, field1, field2)
    return this
  }

  leftOuterJoin (table, field1, field2) {
    this.internalJoin('LEFT OUTER', table, field1, field2)
    return this
  }

  rightJoin (table, field1, field2) {
    this.internalJoin('RIGHT', table, field1, field2)
    return this
  }

  rightOuterJoin (table, field1, field2) {
    this.internalJoin('RIGHT OUTER', table, field1, field2)
    return this
  }

  fullOuterJoin (table, field1, field2) {
    this.internalJoin('FULL OUTER', table, field1, field2)
    return this
  }

  crossJoin (table, field1, field2) {
    this.internalJoin('CROSS', table, field1, field2)
    return this
  }

  joinRaw (str) {
    this.joinFields.push(str)
    return this
  }

  clearSelect () {
    this.fields = []
    return this
  }

  insert (obj) {
    this.type = 'INSERT'
    this.fields = []
    this.values = []
    this.params = []
    let arr
    if (Array.isArray(obj)) {
      arr = obj
    } else {
      arr = [obj]
    }
    forEach(arr, item => {
      forEach(item, (value, key) => {
        if (this.fields.indexOf(key) === -1) {
          this.fields.push(key)
        }
      })
    })
    forEach(arr, (item, index) => {
      const row = []
      forEach(this.fields, field => {
        this.params.push(item[field])
        row.push('$' + (index * this.fields.length + row.length + 1))
      })
      this.values.push(row)
    })
    return this
  }

  del () {
    this.type = 'DELETE'
    return this
  }

  toSelect () {
    const fields = this.fields.length ? this.fields.join(', ') : '*'

    let str = `SELECT ${fields} FROM ${this.constructor.escapeField(this.table)}`
    if (this.joinFields.length) {
      str += ' ' + this.joinFields.join(' ')
    }
    const whereString = this.whereString()
    if (whereString) {
      str += ' WHERE ' + whereString
    }

    return str
  }

  toInsert () {
    const escapeFieldAux = this.constructor.escapeField
    let str = `INSERT INTO ${escapeFieldAux(this.table)}`
    if (this.fields.length) {
      str += ` (${this.fields.map(v => escapeFieldAux(v)).join(', ')})`
    }
    if (this.values.length) {
      str += ' VALUES '
      str += this.values.map(v => `(${v.join(', ')})`).join(', ')
    }
    return str
  }

  toDelete () {
    let str = `DELETE FROM ${this.constructor.escapeField(this.table)}`
    if (this.whereFields.length) {
      str += ' WHERE '
      forEach(this.whereFields, ([type, where], i) => {
        if (i === 0) {
          str += where
        } else {
          str += ` ${type} ${where}`
        }
      })
    }

    return str
  }

  toUpdate () {
    // ...
  }

  toSQL () {
    if (this.type === 'INSERT') {
      return {
        sql: this.toInsert(),
        bindings: this.params
      }
    } else if (this.type === 'SELECT') {
      return {
        sql: this.toSelect(),
        bindings: this.params
      }
    } else if (this.type === 'DELETE') {
      return {
        sql: this.toDelete(),
        bindings: this.params
      }
    }
  }

  toQuery () {
    const query = this.toSQL()
    return query.sql.replace(/\$[0-9]+/g, (n, index) => {
      return query.bindings[index]
    })
  }

  toString () {
    return this.toQuery()
  }
}