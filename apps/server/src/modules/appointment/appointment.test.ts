import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

describe('Appointment booking flow', () => {
  let hospitalId: string;
  let doctorProfileId: string;
  let patientId: string;
  let patientToken: string;
  let doctorToken: string;
  let healthOfficerToken: string;

  beforeAll(async () => {
    const adminRegister = await request(app)
      .post('/api/v1/auth/register-admin')
      .send({
        hospitalName: 'Test General Hospital',
        email: `admin.${Date.now()}@example.com`,
        password: 'Password123',
      });
    const adminToken = adminRegister.body.data.accessToken;

    const adminMe = await request(app)
      .get('/api/v1/admin/me')
      .set('Authorization', `Bearer ${adminToken}`);
    hospitalId = adminMe.body.data.hospitalId;

    const doctorEmail = `doctor.${Date.now()}@example.com`;
    const createDoctorResponse = await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: doctorEmail,
        password: 'Password123',
        firstName: 'Test',
        lastName: 'Doctor',
        specialization: ['General Medicine'],
      });
    doctorProfileId = createDoctorResponse.body.data._id;

    const doctorLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: doctorEmail, password: 'Password123' });
    doctorToken = doctorLogin.body.data.accessToken;

    const officerEmail = `officer.${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/health-officers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: officerEmail,
        password: 'Password123',
        firstName: 'Test',
        lastName: 'Officer',
      });

    const officerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: officerEmail, password: 'Password123' });
    healthOfficerToken = officerLogin.body.data.accessToken;

    const patientRegister = await request(app).post('/api/v1/auth/register').send({
      email: `patient.${Date.now()}@example.com`,
      password: 'Password123',
      firstName: 'Test',
      lastName: 'Patient',
      age: 29,
      hospitalId,
    });
    patientToken = patientRegister.body.data.accessToken;

    const patientMe = await request(app)
      .get('/api/v1/patients/me')
      .set('Authorization', `Bearer ${patientToken}`);
    patientId = patientMe.body.data._id;
  });

  it('rejects a patient trying to book an appointment for themselves', async () => {
    const response = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorProfileId,
        hospitalId,
        scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'in_person',
        reasonForVisit: 'Annual checkup',
      });

    expect(response.status).toBe(403);
  });

  it('lets a health officer book a pending appointment on behalf of a patient', async () => {
    const response = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${healthOfficerToken}`)
      .send({
        patientId,
        doctorId: doctorProfileId,
        hospitalId,
        scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'in_person',
        reasonForVisit: 'Annual checkup',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('pending');
  });

  it('rejects a patient trying to confirm their own appointment', async () => {
    const bookResponse = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${healthOfficerToken}`)
      .send({
        patientId,
        doctorId: doctorProfileId,
        hospitalId,
        scheduledStart: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        type: 'in_person',
        reasonForVisit: 'Follow-up',
      });
    const appointmentId = bookResponse.body.data._id;

    const confirmAttempt = await request(app)
      .post(`/api/v1/appointments/${appointmentId}/confirm`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(confirmAttempt.status).toBe(403);
  });

  it('lets the doctor confirm a pending appointment', async () => {
    const bookResponse = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${healthOfficerToken}`)
      .send({
        patientId,
        doctorId: doctorProfileId,
        hospitalId,
        scheduledStart: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        type: 'in_person',
        reasonForVisit: 'Consultation',
      });
    const appointmentId = bookResponse.body.data._id;

    const confirmResponse = await request(app)
      .post(`/api/v1/appointments/${appointmentId}/confirm`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.body.data.status).toBe('confirmed');
  });

  it('rejects booking a conflicting time slot with the same doctor', async () => {
    const scheduledStart = new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString();

    const first = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${healthOfficerToken}`)
      .send({ patientId, doctorId: doctorProfileId, hospitalId, scheduledStart, type: 'in_person', reasonForVisit: 'A' });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${healthOfficerToken}`)
      .send({ patientId, doctorId: doctorProfileId, hospitalId, scheduledStart, type: 'in_person', reasonForVisit: 'B' });
    expect(second.status).toBe(409);
  });
});
