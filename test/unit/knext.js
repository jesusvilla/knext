import test from 'ava'
import Knext from '../../src/index'
import { config } from '../config'

const dialect = process.env.DIALECT || 'firebird'
const knext = Knext(config[dialect])

// DOCS: http://michaelavila.com/knex-querylab/

test('SELECT: TABLE', t => {
  const sql = knext('song')
  const res = 'SELECT * FROM song'
  t.is(sql.toString(), res)
})

test('SELECT: TABLE WITH ALIAS', t => {
  const sql = knext('song as s')
  const res = 'SELECT * FROM song as s'
  t.is(sql.toString(), res)
})

test('SELECT: COLUMNS (STRING)', async t => {
  const sql = knext('song as s').select('id', 'title')
  const res = 'SELECT id, title FROM song as s'
  t.is(sql.toString(), res)
})

test('SELECT: COLUMNS (ARRAY)', async t => {
  // fixed: 0.0.5
  const sql = knext('song as s').select(['id', 'title'])
  const res = 'SELECT id, title FROM song as s'
  t.is(sql.toString(), res)
})

test('SELECT: COLUMNS (OBJECT)', async t => {
  const sql = knext('song as s').select({ i: 'id', t: 'title' })
  const res = 'SELECT id AS i, title AS t FROM song as s'
  t.is(sql.toString(), res)
})

test('SELECT: COLUMNS (ANY)', async t => {
  const sql = knext('song as s').select({ i: 'id' }, ['author'], 'title')
  const res = 'SELECT id AS i, author, title FROM song as s'
  t.is(sql.toString(), res)
})

if (process.env.LOCAL) {
  test('Result', async t => {
    // FIREBIRD: TEST NAME COLUMN
    const res = await knext('song').select('title').where('id', '<=', 2).orWhereNull('title')
    res.forEach(v => {
      Object.keys(v).forEach(c => {
        v[c] = v[c] + ''
      })
    })
    t.deepEqual(res, [{ title: 'Primero' }, { title: 'Segundo' }])
  })

  /* test('Stream', async t => {
    const stream = knext('song').select('title').where('id', '<=', 2).orWhereNull('title').stream()

    // stream.pipe(process.stdout)
    stream.on('data', chunk => {
      console.log('test:chunk', chunk)
    })

    await new Promise((resolve) => {
      stream.on('end', () => {
        resolve()
      })
    })
    t.is(true, true)
  }) */
}