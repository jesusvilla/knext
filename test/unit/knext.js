const test = require('ava')
const Knext = require('../../src/index')
const config = require('../config')

test('Select', t => {
  // DOCS: http://michaelavila.com/knex-querylab/
  const knext = Knext(config.postgres)
  const sql = knext('song').select('title').where('id', '<=', 2).orWhereNull('title')
  const res = 'SELECT "title" FROM "song" WHERE "id" <= $1 OR "title" IS NULL'
  t.is(sql.toString(), res)
})

/* test('Result', async t => {
  const knext = Knext(config.postgres)
  const res = await knext('song').select('title').where('id', '<=', 2).orWhereNull('title')
  t.deepEqual(res, [{ title: 'Primero' }, { title: 'Segundo' }])
}) */