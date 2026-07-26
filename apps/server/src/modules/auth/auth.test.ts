import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

function extractRefreshCookie(setCookieHeader: string | string[] | undefined): string {
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader ?? ''];
  const cookie = cookies.find((c) => c.startsWith('telemedicine_refresh_token='));
  if (!cookie) throw new Error('Refresh cookie not set');
  return cookie.split(';')[0];
}

describe('Auth flow', () => {
  const email = `patient.${Date.now()}@example.com`;
  const password = 'Password123';

  it('registers a new patient account', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email,
      password,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'patient',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe(email);
  });

  it('rejects registering the same email twice', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email,
      password,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'patient',
    });

    expect(response.status).toBe(409);
  });

  it('logs in and receives an access token plus a refresh cookie', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.headers['set-cookie']).toBeTruthy();
  });

  it('rejects login with the wrong password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassword1' });

    expect(response.status).toBe(401);
  });

  it('returns the current user from /auth/me with a valid access token', async () => {
    const loginResponse = await request(app).post('/api/v1/auth/login').send({ email, password });
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(email);
  });

  it('rotates the refresh token and detects reuse of a revoked token', async () => {
    const loginResponse = await request(app).post('/api/v1/auth/login').send({ email, password });
    const originalCookie = extractRefreshCookie(loginResponse.headers['set-cookie']);

    const refreshResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', originalCookie);

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data.accessToken).toBeTruthy();
    const rotatedCookie = extractRefreshCookie(refreshResponse.headers['set-cookie']);
    expect(rotatedCookie).not.toBe(originalCookie);

    // Reusing the now-revoked original refresh token must fail...
    const reuseResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', originalCookie);
    expect(reuseResponse.status).toBe(401);

    // ...and must revoke the entire rotation family, so even the freshly
    // rotated (legitimate) token stops working too.
    const followUpResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', rotatedCookie);
    expect(followUpResponse.status).toBe(401);
  });

  it('clears the session on logout', async () => {
    const loginResponse = await request(app).post('/api/v1/auth/login').send({ email, password });
    const cookie = extractRefreshCookie(loginResponse.headers['set-cookie']);

    const logoutResponse = await request(app).post('/api/v1/auth/logout').set('Cookie', cookie);
    expect(logoutResponse.status).toBe(200);

    const refreshAfterLogout = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);
    expect(refreshAfterLogout.status).toBe(401);
  });
});
