export default Interface => class extends Interface {
  async connect () {
    return new Promise((resolve, reject) => {
      this.pool.get((err, db) => {
        if (err) {
          reject(err)
        } else {
          resolve(db)
        }
      })
    })
  }

  async execute () {
    const query = this.toSQL()
    const db = await this.connect()
    return new Promise((resolve, reject) => {
      db.query(query.sql, query.bindings, (err, result) => {
        db.detach()
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  stream (cb) {
    const { Readable } = require('stream')
    const streamReadable = new Readable({ objectMode: true })

    this.connect().then(db => {
      const query = this.toSQL()
      db.sequentially(query.sql, query.bindings, (row, index, next) => {
        streamReadable.push(row)
        next()
      }, err => {
        db.detach()
        if (err) {
          streamReadable.destroy(err)
        } else {
          streamReadable.push(null)
        }
      })
    }).catch(err => {
      streamReadable.destroy(err)
    })

    if (typeof cb === 'function') {
      cb(streamReadable)
    }
    return streamReadable
  }
}