import { Types } from 'mongoose';
import { AppointmentModel } from '../appointment/appointment.model';
import { PatientModel } from '../patient/patient.model';
import { DoctorModel } from '../doctor/doctor.model';
import { HealthOfficerModel } from '../health-officer/healthOfficer.model';
import { ConsultationModel } from '../consultation/consultation.model';

export const reportService = {
  async appointmentsByStatus(hospitalId: string) {
    const results = await AppointmentModel.aggregate([
      { $match: { hospitalId: new Types.ObjectId(hospitalId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]);
    return results;
  },

  async appointmentsOverTime(hospitalId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const results = await AppointmentModel.aggregate([
      { $match: { hospitalId: new Types.ObjectId(hospitalId), scheduledStart: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$scheduledStart' } },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: '$_id', count: 1 } },
      { $sort: { date: 1 } },
    ]);
    return results;
  },

  async doctorUtilization(hospitalId: string) {
    const results = await AppointmentModel.aggregate([
      { $match: { hospitalId: new Types.ObjectId(hospitalId) } },
      { $group: { _id: '$doctorId', appointmentCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor.userId',
          foreignField: '_id',
          as: 'doctorUser',
        },
      },
      { $unwind: '$doctorUser' },
      {
        $project: {
          _id: 0,
          doctorId: '$_id',
          appointmentCount: 1,
          firstName: '$doctorUser.firstName',
          lastName: '$doctorUser.lastName',
        },
      },
      { $sort: { appointmentCount: -1 } },
    ]);
    return results;
  },

  async patientDemographics(hospitalId: string) {
    const results = await PatientModel.aggregate([
      { $match: { hospitalId: new Types.ObjectId(hospitalId) } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $project: { _id: 0, gender: { $ifNull: ['$_id', 'unspecified'] }, count: 1 } },
    ]);
    return results;
  },

  async summary(hospitalId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalDoctors, totalHealthOfficers, totalPatients, totalAppointments, todaysConsultations, statusBreakdown] =
      await Promise.all([
        DoctorModel.countDocuments({ hospitalId }),
        HealthOfficerModel.countDocuments({ hospitalId }),
        PatientModel.countDocuments({ hospitalId }),
        AppointmentModel.countDocuments({ hospitalId }),
        ConsultationModel.countDocuments({ hospitalId, createdAt: { $gte: startOfToday } }),
        reportService.appointmentsByStatus(hospitalId),
      ]);

    return {
      totalDoctors,
      totalHealthOfficers,
      totalPatients,
      totalAppointments,
      todaysConsultations,
      statusBreakdown,
    };
  },
};
