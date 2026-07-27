const test = require('node:test');
const assert = require('node:assert/strict');

test('get-presigned-url handler module exports a handler', () => {
  const { handler } = require('./index');

  assert.equal(typeof handler, 'function');
});
