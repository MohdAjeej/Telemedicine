import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

function extractRefreshCookie(setCookieHeader: string | string[] | undefined): string {
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader ?? ''];
  const cookie = cookies.find((c) => c.startsWith('telemedicine_refresh_token='));
  if (!cookie) throw new Error('Refresh cookie not set');
  return cookie.split(';')[0];
}

describe('Admin registration (creates a Hospital)', () => {
  it('creates a Hospital and Admin together, and logs the admin in immediately', async () => {
    const email = `admin.${Date.now()}@example.com`;
    const response = await request(app).post('/api/v1/auth/register-admin').send({
      hospitalName: 'Riverside General',
      email,
      password: 'Password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user.role).toBe('admin');
    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.headers['set-cookie']).toBeTruthy();
  });

  it('rejects registering the same admin email twice', async () => {
    const email = `admin-dupe.${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/auth/register-admin')
      .send({ hospitalName: 'Dupe Hospital', email, password: 'Password123' });

    const response = await request(app)
      .post('/api/v1/auth/register-admin')
      .send({ hospitalName: 'Dupe Hospital 2', email, password: 'Password123' });

    expect(response.status).toBe(409);
  });
});

describe('Patient auth flow', () => {
  const email = `patient.${Date.now()}@example.com`;
  const password = 'Password123';
  let hospitalId: string;

  beforeAll(async () => {
    const adminRegister = await request(app)
      .post('/api/v1/auth/register-admin')
      .send({
        hospitalName: 'Patient Flow Test Hospital',
        email: `admin-for-patient-flow.${Date.now()}@example.com`,
        password: 'Password123',
      });
    const adminToken = adminRegister.body.data.accessToken;

    const meResponse = await request(app)
      .get('/api/v1/admin/me')
      .set('Authorization', `Bearer ${adminToken}`);
    hospitalId = meResponse.body.data.hospitalId;
  });

  it('registers a new patient with age + hospital and logs them in immediately', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email,
      password,
      firstName: 'Jane',
      lastName: 'Doe',
      age: 32,
      hospitalId,
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user.role).toBe('patient');
    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.headers['set-cookie']).toBeTruthy();
  });

  it('rejects registering the same email twice', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email,
      password,
      firstName: 'Jane',
      lastName: 'Doe',
      age: 32,
      hospitalId,
    });

    expect(response.status).toBe(409);
  });

  it('rejects registration against a non-existent hospital', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: `nohospital.${Date.now()}@example.com`,
      password,
      firstName: 'No',
      lastName: 'Hospital',
      age: 20,
      hospitalId: '650000000000000000000000',
    });

    expect(response.status).toBe(400);
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
