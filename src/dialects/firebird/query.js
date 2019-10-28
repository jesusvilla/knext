import Query from '@src/query'

export default class QueryDB extends Query {
  _limitString () {
    let query = ''
    if (this._limit !== void 0) {
      query = `FIRST ${this._limit}`
    }
    if (this._offset !== void 0) {
      if (query !== '') {
        query += ' '
      }
      query += `SKIP ${this._offset}`
    }
    return {
      query,
      position: 'before' // 'before', 'after'
    }
  }
}