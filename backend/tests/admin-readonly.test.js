const test = require('node:test');
const assert = require('node:assert/strict');
const { adminReadOnlyGuard } = require('../middleware/auth');

test('adminReadOnlyGuard blocks non-GET methods for admin users', () => {
  let nextCalled = false;
  const req = { user: { role: 'admin' }, method: 'DELETE' };
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };

  adminReadOnlyGuard(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /read-only/i);
});

test('adminReadOnlyGuard allows GET for admin users', () => {
  let nextCalled = false;
  const req = { user: { role: 'admin' }, method: 'GET' };
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };

  adminReadOnlyGuard(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
});
