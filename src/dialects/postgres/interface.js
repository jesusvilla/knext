export default Interface => class extends Interface {
  async connect () {
    return this.pool.connect()
  }

  async execute () {
    const client = await this.connect()
    try {
      const query = this.toSQL()
      const res = await client.query(query.sql, query.bindings)
      return res.rows
    } finally {
      await client.release()
    }
  }

  stream (cb) {
    const QueryStream = require('pg-query-stream')
    const { Readable } = require('stream')

    const streamPromise = this.connect().then(client => {
      const query = this.toSQL()
      const qStream = new QueryStream(query.sql, query.bindings)
      const stream = client.query(qStream)
      stream.on('end', () => {
        client.release()
      })
      return stream
    })

    const streamReadable = new Readable({
      objectMode: true,
      read (size) {
        streamPromise.then(stream => {
          stream.on('data', chunk => {
            this.push(chunk)
          })

          stream.on('end', () => {
            this.push(null)
          })
        })
      }
    })

    streamPromise.catch(err => {
      streamReadable.destroy(err)
    })

    if (typeof cb === 'function') {
      cb(streamReadable)
    }
    return streamReadable
  }
}