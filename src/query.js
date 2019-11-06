import forEach from '@utils/foreach'
import * as valid from '@utils/valid'

/* function escapeField (field) {
  return '"' + field.replace(/"/g, '""') + '"'
} */

export default class Query {
  constructor (table) {
    this.table = table
    this.fields = []
    this.values = []
    this.type = 'SELECT'
    this.whereFields = []
    this.joinFields = []
    this.params = []
    // this._limit
    // this._offset
  }

  escapeField (field) {
    return field
    /* if (field === '*') return field
    const matchedField = field.match(/([a-z0-9]+) as ([a-z0-9]+)/i)
    if (matchedField) {
      return `${escapeField(matchedField[1])} AS ${escapeField(matchedField[2])}`
    } else {
      const matchedFieldPoint = field.match(/([a-z0-9]+)\.([a-z0-9]+)/i)
      if (matchedFieldPoint) {
        return `${escapeField(matchedFieldPoint[1])}.${escapeField(matchedFieldPoint[2])}`
      }
    }
    return escapeField(field) */
  }

  from (table) {
    this.table = table
    return this
  }

  select () {
    const escapeFieldAux = this.escapeField
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

  _getSymbolParam (pos) {
    if (pos === void 0) {
      pos = this.params.length
    }
    return '$' + pos
  }

  _allWhere (type, args) {
    if (args.length === 1 && typeof args[0] === 'function') {
      const newWhere = new Query()
      newWhere.params = this.params
      args[0].call(newWhere)
      this.whereFields.push([type, `(${newWhere._whereString()})`])
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
        this.whereFields.push([type, `${this.escapeField(field)} ${operator} ${this._getSymbolParam()}`])
      }
    }
  }

  andWhere () {
    this._allWhere('AND', arguments)
    return this
  }

  orWhere () {
    this._allWhere('OR', arguments)
    return this
  }

  whereIn () {
    // TODO: Validate
    this._allWhere('AND', [arguments[0], 'IN', arguments[1]])
  }

  where () {
    return this.andWhere.apply(this, arguments)
  }

  whereNull (field) {
    this.whereFields.push(['AND', `${this.escapeField(field)} IS NULL`])
    return this
  }

  orWhereNull (field) {
    this.whereFields.push(['OR', `${this.escapeField(field)} IS NULL`])
    return this
  }

  whereRaw (str) {
    this.whereFields.push(['AND', str])
    return this
  }

  _whereString () {
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

  _internalJoin (type, table, field1, field2) {
    this.joinFields.push(`${type} JOIN ${this.escapeField(table)} ON ${this.escapeField(field1)} = ${this.escapeField(field2)}`)
  }

  innerJoin (table, field1, field2) {
    this._internalJoin('INNER', table, field1, field2)
    return this
  }

  leftJoin (table, field1, field2) {
    this._internalJoin('LEFT', table, field1, field2)
    return this
  }

  leftOuterJoin (table, field1, field2) {
    this._internalJoin('LEFT OUTER', table, field1, field2)
    return this
  }

  rightJoin (table, field1, field2) {
    this._internalJoin('RIGHT', table, field1, field2)
    return this
  }

  rightOuterJoin (table, field1, field2) {
    this._internalJoin('RIGHT OUTER', table, field1, field2)
    return this
  }

  fullOuterJoin (table, field1, field2) {
    this._internalJoin('FULL OUTER', table, field1, field2)
    return this
  }

  crossJoin (table, field1, field2) {
    this._internalJoin('CROSS', table, field1, field2)
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

  limit (num) {
    if (valid.isNumber(num)) {
      this._limit = +num
    }
    return this
  }

  offset (num) {
    if (valid.isNumber(num)) {
      this._offset = +num
    }
    return this
  }

  _limitString () {
    let query = ''
    if (this._limit !== void 0) {
      query = `LIMIT ${this._limit}`
    }
    if (this._offset !== void 0) {
      if (query !== '') {
        query += ' '
      }
      query += `OFFSET ${this._offset}`
    }
    return {
      query,
      position: 'after' // 'before', 'after'
    }
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
        row.push(this._getSymbolParam(index * this.fields.length + row.length + 1))
      })
      this.values.push(row)
    })
    return this
  }

  del () {
    this.type = 'DELETE'
    return this
  }

  _toSelect () {
    const fields = this.fields.length > 0 ? this.fields.join(', ') : '*'
    const limitString = this._limitString()
    const whereString = this._whereString()

    let str = 'SELECT '

    if (limitString.query !== '' && limitString.position === 'before') {
      str += `${limitString.query} `
    }

    str += `${fields} FROM ${this.escapeField(this.table)}`

    if (this.joinFields.length) {
      str += ' ' + this.joinFields.join(' ')
    }

    if (whereString !== '') {
      str += ' WHERE ' + whereString
    }

    if (limitString.query !== '' && limitString.position === 'after') {
      str += ` ${limitString.query}`
    }
    return str
  }

  _toInsert () {
    const escapeFieldAux = this.escapeField
    let str = `INSERT INTO ${escapeFieldAux(this.table)}`
    if (this.fields.length > 0) {
      str += ` (${this.fields.map(v => escapeFieldAux(v)).join(', ')})`
    }
    if (this.values.length > 0) {
      str += ' VALUES '
      str += this.values.map(v => `(${v.join(', ')})`).join(', ')
    }
    return str
  }

  _toDelete () {
    let str = `DELETE FROM ${this.escapeField(this.table)}`
    if (this.whereFields.length > 0) {
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
        sql: this._toInsert(),
        bindings: this.params
      }
    } else if (this.type === 'SELECT') {
      return {
        sql: this._toSelect(),
        bindings: this.params
      }
    } else if (this.type === 'DELETE') {
      return {
        sql: this._toDelete(),
        bindings: this.params
      }
    }
  }

  toQuery () {
    const query = this.toSQL()
    return query.sql.replace(/\$\d+/g, (n, index) => {
      return query.bindings[index]
    })
  }

  toString () {
    return this.toQuery()
  }
}