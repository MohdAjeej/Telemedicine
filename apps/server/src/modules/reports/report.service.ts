import { AppointmentModel } from '../appointment/appointment.model';
import { PatientModel } from '../patient/patient.model';
import { DoctorModel } from '../doctor/doctor.model';

export const reportService = {
  async appointmentsByStatus() {
    const results = await AppointmentModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]);
    return results;
  },

  async appointmentsOverTime(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const results = await AppointmentModel.aggregate([
      { $match: { scheduledStart: { $gte: since } } },
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

  async doctorUtilization(hospitalId?: string) {
    const match: Record<string, unknown> = {};
    if (hospitalId) match.hospitalId = hospitalId;

    const results = await AppointmentModel.aggregate([
      { $match: match },
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

  async patientDemographics() {
    const results = await PatientModel.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $project: { _id: 0, gender: { $ifNull: ['$_id', 'unspecified'] }, count: 1 } },
    ]);
    return results;
  },

  async summary() {
    const [totalDoctors, totalPatients, totalAppointments, statusBreakdown] = await Promise.all([
      DoctorModel.countDocuments(),
      PatientModel.countDocuments(),
      AppointmentModel.countDocuments(),
      reportService.appointmentsByStatus(),
    ]);

    return { totalDoctors, totalPatients, totalAppointments, statusBreakdown };
  },
};
