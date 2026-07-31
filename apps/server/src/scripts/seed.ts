/* eslint-disable no-console */
import { env } from '../config/env';
import { connectDatabase, disconnectDatabase } from '../database/connection';
import { hashValue } from '../utils/hash';
import { UserModel } from '../modules/auth/user.model';
import { HospitalModel } from '../modules/hospital/hospital.model';
import { DoctorModel } from '../modules/doctor/doctor.model';
import { PatientModel } from '../modules/patient/patient.model';
import { HealthOfficerModel } from '../modules/health-officer/healthOfficer.model';
import { AdminModel } from '../modules/admin/admin.model';
import { AppointmentModel } from '../modules/appointment/appointment.model';

const SEED_PASSWORD = 'Password123';

async function upsertUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'doctor' | 'health_officer' | 'patient';
  hospitalId: unknown;
}) {
  const passwordHash = await hashValue(SEED_PASSWORD);
  return UserModel.findOneAndUpdate(
    { email: input.email },
    {
      email: input.email,
      passwordHash,
      role: input.role,
      hospitalId: input.hospitalId,
      firstName: input.firstName,
      lastName: input.lastName,
      isEmailVerified: true,
      status: 'active',
    },
    { upsert: true, new: true },
  );
}

async function seed(): Promise<void> {
  await connectDatabase();
  console.log(`Seeding database: ${env.MONGO_URI}`);

  const hospital = await HospitalModel.findOneAndUpdate(
    { registrationNumber: 'SEED-0001' },
    {
      name: 'Riverside General Hospital',
      registrationNumber: 'SEED-0001',
      type: 'hospital',
      address: { street: '100 Riverside Dr', city: 'Springfield', state: 'IL', country: 'USA' },
      contact: { phone: '555-0100', email: 'contact@riverside.example' },
      departments: ['General Medicine', 'Cardiology', 'Pediatrics'],
      status: 'active',
    },
    { upsert: true, new: true },
  );

  const adminUser = await upsertUser({
    email: 'admin@telemedicine.local',
    firstName: 'Alice',
    lastName: 'Admin',
    role: 'admin',
    hospitalId: hospital._id,
  });
  await AdminModel.findOneAndUpdate(
    { userId: adminUser._id },
    {
      userId: adminUser._id,
      hospitalId: hospital._id,
      permissions: ['*'],
      department: 'Platform Operations',
    },
    { upsert: true },
  );

  const doctorUser = await upsertUser({
    email: 'doctor@telemedicine.local',
    firstName: 'David',
    lastName: 'Carter',
    role: 'doctor',
    hospitalId: hospital._id,
  });
  const doctor = await DoctorModel.findOneAndUpdate(
    { userId: doctorUser._id },
    {
      userId: doctorUser._id,
      hospitalId: hospital._id,
      specialization: ['General Medicine'],
      licenseNumber: 'LIC-SEED-001',
      qualifications: ['MBBS', 'MD'],
      experienceYears: 8,
      consultationFee: 75,
      department: 'General Medicine',
      bio: 'Seeded demo doctor account.',
    },
    { upsert: true, new: true },
  );

  const healthOfficerUser = await upsertUser({
    email: 'healthofficer@telemedicine.local',
    firstName: 'Hana',
    lastName: 'Ortiz',
    role: 'health_officer',
    hospitalId: hospital._id,
  });
  await HealthOfficerModel.findOneAndUpdate(
    { userId: healthOfficerUser._id },
    {
      userId: healthOfficerUser._id,
      hospitalId: hospital._id,
      assignedClinic: 'Main Clinic',
      employeeId: 'EMP-SEED-001',
    },
    { upsert: true },
  );

  const patientUser = await upsertUser({
    email: 'patient@telemedicine.local',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'patient',
    hospitalId: hospital._id,
  });
  const patient = await PatientModel.findOneAndUpdate(
    { userId: patientUser._id },
    {
      userId: patientUser._id,
      hospitalId: hospital._id,
      age: 32,
      gender: 'female',
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      chronicConditions: [],
    },
    { upsert: true, new: true },
  );

  const scheduledStart = new Date();
  scheduledStart.setDate(scheduledStart.getDate() + 1);
  scheduledStart.setHours(10, 0, 0, 0);
  const scheduledEnd = new Date(scheduledStart.getTime() + 30 * 60 * 1000);

  await AppointmentModel.findOneAndUpdate(
    { doctorId: doctor._id, patientId: patient._id, scheduledStart },
    {
      patientId: patient._id,
      doctorId: doctor._id,
      hospitalId: hospital._id,
      scheduledStart,
      scheduledEnd,
      type: 'in_person',
      status: 'pending',
      reasonForVisit: 'Annual checkup (seed data)',
      createdBy: patientUser._id,
    },
    { upsert: true },
  );

  console.log('\nSeed complete. Demo accounts (password for all: "%s"):', SEED_PASSWORD);
  console.log('  Admin:          admin@telemedicine.local');
  console.log('  Doctor:         doctor@telemedicine.local');
  console.log('  Health Officer: healthofficer@telemedicine.local');
  console.log('  Patient:        patient@telemedicine.local');

  await disconnectDatabase();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
