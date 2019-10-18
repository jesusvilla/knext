// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"eUlD":[function(require,module,exports) {
function forEachIterable(iterable, cb) {
  for (let i = 0, length = iterable.length; i < length; i++) {
    cb(iterable[i], i);
  }
}

function forEachObject(object, cb) {
  forEachIterable(Object.keys(object), key => {
    cb(object[key], key);
  });
}
/**
 * forEach
 *
 * @callback iterableCallback
 * @param {*} item - Value of each element
 * @param {(number|string)} key - If 'element' is iterable then returns number, else string
 *
 * @param {(*[]|Object|string)} element
 * @param {iterableCallback} cb - The callback of each iteration
 */


module.exports = function forEach(element, cb) {
  if (element === null || element === void 0) {
    return void 0;
  }

  if (element.length !== void 0) {
    forEachIterable(element, cb);
  } else if (typeof element === 'object') {
    forEachObject(element, cb);
  }
};
},{}],"aXbA":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const forEach = require("./utils/foreach");

function escapeField(field) {
  return '"' + field.replace(/"/g, '""') + '"';
}

class Query {
  constructor(table) {
    this.table = table;
    this.fields = [];
    this.values = [];
    this.type = 'SELECT';
    this.whereFields = [];
    this.joinFields = [];
    this.params = [];
  }

  static escapeField(field) {
    if (field === '*') return field;
    const matchedField = field.match(/([a-z0-9]+) as ([a-z0-9]+)/i);

    if (matchedField) {
      return `${escapeField(matchedField[1])} AS ${escapeField(matchedField[2])}`;
    } else {
      const matchedFieldPoint = field.match(/([a-z0-9]+)\.([a-z0-9]+)/i);

      if (matchedFieldPoint) {
        return `${escapeField(matchedFieldPoint[1])}.${escapeField(matchedFieldPoint[2])}`;
      }
    }

    return escapeField(field);
  }

  from(table) {
    this.table = table;
    return this;
  }

  select() {
    const escapeFieldAux = this.constructor.escapeField;
    forEach(arguments, field => {
      if (field === null || field === void 0) {
        return void 0;
      }

      if (typeof field === 'string') {
        this.fields.push(escapeFieldAux(field));
      } else if (Array.isArray(field)) {
        forEach(field, f => {
          this.fields.push(escapeFieldAux(f));
        });
      } else if (typeof field === 'object') {
        forEach(field, (f, as) => {
          this.fields.push(escapeFieldAux(`${f} AS ${as}`));
        });
      }
    });
    return this;
  }

  allWhere(type, args) {
    if (args.length === 1 && typeof args[0] === 'function') {
      const newWhere = new Query();
      newWhere.params = this.params;
      args[0].call(newWhere);
      this.whereFields.push([type, `(${newWhere.whereString()})`]);
    } else {
      const field = args[0];
      let operator, value;

      if (args.length === 2) {
        operator = '=';
        value = args[1];
      } else if (args.length === 3) {
        operator = args[1];
        value = args[2];
      }

      if (operator) {
        this.params.push(value);
        this.whereFields.push([type, `${this.constructor.escapeField(field)} ${operator} $${this.params.length}`]);
      }
    }
  }

  andWhere() {
    this.allWhere('AND', arguments);
    return this;
  }

  orWhere() {
    this.allWhere('OR', arguments);
    return this;
  }

  whereIn() {
    // TODO: Validate
    this.allWhere('AND', [arguments[0], 'IN', arguments[1]]);
  }

  where() {
    return this.andWhere.apply(this, arguments);
  }

  whereNull(field) {
    this.whereFields.push(['AND', `${this.constructor.escapeField(field)} IS NULL`]);
    return this;
  }

  orWhereNull(field) {
    this.whereFields.push(['OR', `${this.constructor.escapeField(field)} IS NULL`]);
    return this;
  }

  whereRaw(str) {
    this.whereFields.push(['AND', str]);
    return this;
  }

  whereString() {
    // Internal
    let str = '';

    if (this.whereFields.length) {
      forEach(this.whereFields, ([type, where], i) => {
        if (i === 0) {
          str += where;
        } else {
          str += ` ${type} ${where}`;
        }
      });
    }

    return str;
  }

  internalJoin(type, table, field1, field2) {
    this.joinFields.push(`${type} JOIN ${this.constructor.escapeField(table)} ON ${this.constructor.escapeField(field1)} = ${this.constructor.escapeField(field2)}`);
  }

  innerJoin(table, field1, field2) {
    this.internalJoin('INNER', table, field1, field2);
    return this;
  }

  leftJoin(table, field1, field2) {
    this.internalJoin('LEFT', table, field1, field2);
    return this;
  }

  leftOuterJoin(table, field1, field2) {
    this.internalJoin('LEFT OUTER', table, field1, field2);
    return this;
  }

  rightJoin(table, field1, field2) {
    this.internalJoin('RIGHT', table, field1, field2);
    return this;
  }

  rightOuterJoin(table, field1, field2) {
    this.internalJoin('RIGHT OUTER', table, field1, field2);
    return this;
  }

  fullOuterJoin(table, field1, field2) {
    this.internalJoin('FULL OUTER', table, field1, field2);
    return this;
  }

  crossJoin(table, field1, field2) {
    this.internalJoin('CROSS', table, field1, field2);
    return this;
  }

  joinRaw(str) {
    this.joinFields.push(str);
    return this;
  }

  clearSelect() {
    this.fields = [];
    return this;
  }

  insert(obj) {
    this.type = 'INSERT';
    this.fields = [];
    this.values = [];
    this.params = [];
    let arr;

    if (Array.isArray(obj)) {
      arr = obj;
    } else {
      arr = [obj];
    }

    forEach(arr, item => {
      forEach(item, (value, key) => {
        if (this.fields.indexOf(key) === -1) {
          this.fields.push(key);
        }
      });
    });
    forEach(arr, (item, index) => {
      const row = [];
      forEach(this.fields, field => {
        this.params.push(item[field]);
        row.push('$' + (index * this.fields.length + row.length + 1));
      });
      this.values.push(row);
    });
    return this;
  }

  del() {
    this.type = 'DELETE';
    return this;
  }

  toSelect() {
    const fields = this.fields.length ? this.fields.join(', ') : '*';
    let str = `SELECT ${fields} FROM ${this.constructor.escapeField(this.table)}`;

    if (this.joinFields.length) {
      str += ' ' + this.joinFields.join(' ');
    }

    const whereString = this.whereString();

    if (whereString) {
      str += ' WHERE ' + whereString;
    }

    return str;
  }

  toInsert() {
    const escapeFieldAux = this.constructor.escapeField;
    let str = `INSERT INTO ${escapeFieldAux(this.table)}`;

    if (this.fields.length) {
      str += ` (${this.fields.map(v => escapeFieldAux(v)).join(', ')})`;
    }

    if (this.values.length) {
      str += ' VALUES ';
      str += this.values.map(v => `(${v.join(', ')})`).join(', ');
    }

    return str;
  }

  toDelete() {
    let str = `DELETE FROM ${this.constructor.escapeField(this.table)}`;

    if (this.whereFields.length) {
      str += ' WHERE ';
      forEach(this.whereFields, ([type, where], i) => {
        if (i === 0) {
          str += where;
        } else {
          str += ` ${type} ${where}`;
        }
      });
    }

    return str;
  }

  toUpdate() {// ...
  }

  toSQL() {
    if (this.type === 'INSERT') {
      return {
        sql: this.toInsert(),
        bindings: this.params
      };
    } else if (this.type === 'SELECT') {
      return {
        sql: this.toSelect(),
        bindings: this.params
      };
    } else if (this.type === 'DELETE') {
      return {
        sql: this.toDelete(),
        bindings: this.params
      };
    }
  }

  toQuery() {
    const query = this.toSQL();
    return query.sql.replace(/\$[0-9]+/g, (n, index) => {
      return query.bindings[index];
    });
  }

  toString() {
    return this.toQuery();
  }

}

exports.default = Query;
},{"./utils/foreach":"eUlD"}],"xoC2":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _query = _interopRequireDefault(require("./query"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function execute() {
  const client = await this.pool.connect();

  try {
    const query = this.toSQL();
    const res = await client.query(query.sql, query.bindings);
    return res.rows;
  } finally {
    await client.release();
  }
}
/* function execute () {
    return this.pool.connect().then(client => {
        return client.query(this.toString())
        .then(res => res.rows)
        .finally(() => {
            client.release()
        })
    })
} */


class Interface extends _query.default {
  constructor(pool, table) {
    super(table);
    this.pool = pool;
  }
  /* #execute () {
    } */


  then(resolve, reject) {
    return execute.call(this).then(resolve, reject);
  }

  catch(reject) {
    return execute.call(this).catch(reject);
  }

}

exports.default = Interface;
},{"./query":"aXbA"}],"Focm":[function(require,module,exports) {
"use strict";

var _interface = _interopRequireDefault(require("./interface"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function Knex(config) {
  const {
    Pool
  } = require('pg');

  const pool = new Pool(config.connection);
  return function (table) {
    return new _interface.default(pool, table);
  };
};
},{"./interface":"xoC2"}]},{},["Focm"], null)
//# sourceMappingURL=/index.js.map