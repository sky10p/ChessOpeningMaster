import request from 'supertest';
import app from '../app';
import { connectDB } from '../db/mongo';

describe('Repertoires API', () => {
  it('should get all repertoires', async () => {
    const res = await request(app).get('/repertoires');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});

afterAll(async () => {
  const client = await connectDB();
  await client.close();
});
