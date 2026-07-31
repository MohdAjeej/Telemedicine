/* eslint-disable no-console */
import { connectDatabase, disconnectDatabase } from '../database/connection';
import { UserModel } from '../modules/auth/user.model';
import { AdminModel } from '../modules/admin/admin.model';
import { DoctorModel } from '../modules/doctor/doctor.model';
import { HealthOfficerModel } from '../modules/health-officer/healthOfficer.model';
import { PatientModel } from '../modules/patient/patient.model';
import { AppointmentModel } from '../modules/appointment/appointment.model';
import { ConsultationModel } from '../modules/consultation/consultation.model';
import { VitalModel } from '../modules/vital/vital.model';
import { PrescriptionModel } from '../modules/prescription/prescription.model';
import { LabReportModel } from '../modules/lab-report/labReport.model';
import { MedicalRecordModel } from '../modules/medical-record/medicalRecord.model';

/**
 * One-off backfill for documents created before `hospitalId` was added to
 * their schema (User, Consultation, Vital, Prescription, LabReport,
 * MedicalRecord). Derives each missing hospitalId from an already-scoped
 * parent record (role profile / patient / consultation / appointment) —
 * never invents one. Safe to re-run: only touches documents where
 * hospitalId is currently missing.
 */
async function backfillUsers(): Promise<void> {
  const users = await UserModel.find({ hospitalId: { $exists: false } });
  console.log(`Users missing hospitalId: ${users.length}`);

  let fixed = 0;
  let skipped = 0;
  for (const user of users) {
    let hospitalId: unknown;
    switch (user.role) {
      case 'admin':
        hospitalId = (await AdminModel.findOne({ userId: user._id }))?.hospitalId;
        break;
      case 'doctor':
        hospitalId = (await DoctorModel.findOne({ userId: user._id }))?.hospitalId;
        break;
      case 'health_officer':
        hospitalId = (await HealthOfficerModel.findOne({ userId: user._id }))?.hospitalId;
        break;
      case 'patient':
        hospitalId = (await PatientModel.findOne({ userId: user._id }))?.hospitalId;
        break;
    }
    if (hospitalId) {
      await UserModel.updateOne({ _id: user._id }, { $set: { hospitalId } });
      fixed++;
    } else {
      skipped++;
      console.log(`  SKIP user ${user._id} (${user.email}, role=${user.role}) — no linked profile with a hospitalId found`);
    }
  }
  console.log(`Users backfilled: ${fixed}, skipped: ${skipped}`);
}

async function backfillConsultations(): Promise<void> {
  const consultations = await ConsultationModel.find({ hospitalId: { $exists: false } });
  console.log(`Consultations missing hospitalId: ${consultations.length}`);

  let fixed = 0;
  let skipped = 0;
  for (const consultation of consultations) {
    const appointment = await AppointmentModel.findById(consultation.appointmentId);
    if (appointment?.hospitalId) {
      await ConsultationModel.updateOne(
        { _id: consultation._id },
        { $set: { hospitalId: appointment.hospitalId } },
      );
      fixed++;
    } else {
      skipped++;
      console.log(`  SKIP consultation ${consultation._id} — appointment ${consultation.appointmentId} not found or has no hospitalId`);
    }
  }
  console.log(`Consultations backfilled: ${fixed}, skipped: ${skipped}`);
}

async function backfillVitals(): Promise<void> {
  const vitals = await VitalModel.find({ hospitalId: { $exists: false } });
  console.log(`Vitals missing hospitalId: ${vitals.length}`);

  let fixed = 0;
  let skipped = 0;
  for (const vital of vitals) {
    const patient = await PatientModel.findById(vital.patientId);
    if (patient?.hospitalId) {
      await VitalModel.updateOne({ _id: vital._id }, { $set: { hospitalId: patient.hospitalId } });
      fixed++;
    } else {
      skipped++;
      console.log(`  SKIP vital ${vital._id} — patient ${vital.patientId} not found or has no hospitalId`);
    }
  }
  console.log(`Vitals backfilled: ${fixed}, skipped: ${skipped}`);
}

async function backfillPrescriptions(): Promise<void> {
  const prescriptions = await PrescriptionModel.find({ hospitalId: { $exists: false } });
  console.log(`Prescriptions missing hospitalId: ${prescriptions.length}`);

  let fixed = 0;
  let skipped = 0;
  for (const prescription of prescriptions) {
    const patient = await PatientModel.findById(prescription.patientId);
    if (patient?.hospitalId) {
      await PrescriptionModel.updateOne(
        { _id: prescription._id },
        { $set: { hospitalId: patient.hospitalId } },
      );
      fixed++;
    } else {
      skipped++;
      console.log(`  SKIP prescription ${prescription._id} — patient ${prescription.patientId} not found or has no hospitalId`);
    }
  }
  console.log(`Prescriptions backfilled: ${fixed}, skipped: ${skipped}`);
}

async function backfillLabReports(): Promise<void> {
  const reports = await LabReportModel.find({ hospitalId: { $exists: false } });
  console.log(`LabReports missing hospitalId: ${reports.length}`);

  let fixed = 0;
  let skipped = 0;
  for (const report of reports) {
    const patient = await PatientModel.findById(report.patientId);
    if (patient?.hospitalId) {
      await LabReportModel.updateOne({ _id: report._id }, { $set: { hospitalId: patient.hospitalId } });
      fixed++;
    } else {
      skipped++;
      console.log(`  SKIP lab report ${report._id} — patient ${report.patientId} not found or has no hospitalId`);
    }
  }
  console.log(`LabReports backfilled: ${fixed}, skipped: ${skipped}`);
}

async function backfillMedicalRecords(): Promise<void> {
  const records = await MedicalRecordModel.find({ hospitalId: { $exists: false } });
  console.log(`MedicalRecords missing hospitalId: ${records.length}`);

  let fixed = 0;
  let skipped = 0;
  for (const record of records) {
    const patient = await PatientModel.findById(record.patientId);
    if (patient?.hospitalId) {
      await MedicalRecordModel.updateOne({ _id: record._id }, { $set: { hospitalId: patient.hospitalId } });
      fixed++;
    } else {
      skipped++;
      console.log(`  SKIP medical record ${record._id} — patient ${record.patientId} not found or has no hospitalId`);
    }
  }
  console.log(`MedicalRecords backfilled: ${fixed}, skipped: ${skipped}`);
}

async function run(): Promise<void> {
  await connectDatabase();
  console.log('Backfilling missing hospitalId fields on legacy documents...\n');

  await backfillUsers();
  await backfillConsultations();
  await backfillVitals();
  await backfillPrescriptions();
  await backfillLabReports();
  await backfillMedicalRecords();

  console.log('\nBackfill complete.');
  await disconnectDatabase();
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  });
