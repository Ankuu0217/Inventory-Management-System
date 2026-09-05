const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');

describe('GET /api/health', () => {
  test('returns 200 when the database is connected', async () => {
    expect(mongoose.connection.readyState).toBe(1);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ server: 'up', database: 'connected' });
  });
});

describe('Unmatched routes', () => {
  test('returns a 404 in the standard error envelope', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('/api/does-not-exist');
  });
});
