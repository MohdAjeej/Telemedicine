import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';
import { HospitalModel } from '../hospital/hospital.model';

const app = createApp();

async function registerAndLogin(role: 'patient' | 'doctor', email: string) {
  await request(app).post('/api/v1/auth/register').send({
    email,
    password: 'Password123',
    firstName: 'Test',
    lastName: role,
    role,
  });

  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Password123' });

  return login.body.data.accessToken as string;
}

describe('Appointment booking flow', () => {
  let hospitalId: string;
  let doctorProfileId: string;
  let patientToken: string;
  let doctorToken: string;

  beforeAll(async () => {
    const hospital = await HospitalModel.create({
      name: 'Test General Hospital',
      registrationNumber: `REG-${Date.now()}`,
      type: 'hospital',
      contact: { phone: '555-0100', email: 'contact@testhospital.example' },
    });
    hospitalId = hospital._id.toString();

    doctorToken = await registerAndLogin('doctor', `doctor.${Date.now()}@example.com`);
    const doctorProfileResponse = await request(app)
      .patch('/api/v1/doctors/me')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ hospitalId, specialization: ['General Medicine'], consultationFee: 50 });
    doctorProfileId = doctorProfileResponse.body.data._id;

    patientToken = await registerAndLogin('patient', `patient.${Date.now()}@example.com`);
    await request(app)
      .patch('/api/v1/patients/me')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ gender: 'female' });
  });

  it('lets a patient book a pending appointment with an available doctor', async () => {
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

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('pending');
  });

  it('rejects a patient trying to confirm their own appointment', async () => {
    const bookResponse = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
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
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
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
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId: doctorProfileId, hospitalId, scheduledStart, type: 'in_person', reasonForVisit: 'A' });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId: doctorProfileId, hospitalId, scheduledStart, type: 'in_person', reasonForVisit: 'B' });
    expect(second.status).toBe(409);
  });
});
