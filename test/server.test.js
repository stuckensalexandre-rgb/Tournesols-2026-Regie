const test = require('node:test');
const assert = require('node:assert/strict');
const { sameSecret, server } = require('../server');
test('le code doit correspondre exactement', () => {
  assert.equal(sameSecret('secret-secret', 'secret-secret'), true);
  assert.equal(sameSecret('secret', 'secret-secret'), false);
  assert.equal(sameSecret('secret-secret!', 'secret-secret'), false);
  assert.equal(sameSecret({}, 'secret-secret'), false);
});
test.after(() => server.close());
