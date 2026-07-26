import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('GET /api/v1/health', () => {
  it('returns 200 with an ok status payload', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });
});
