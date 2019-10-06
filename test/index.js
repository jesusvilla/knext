const test = require('ava')

test.before(() => {
  console.log('Start testing')
})

require('./unit/knext')