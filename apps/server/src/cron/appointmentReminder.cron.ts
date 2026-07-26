import cron from 'node-cron';
import { AppointmentModel } from '../modules/appointment/appointment.model';
import { participantUserIds } from '../modules/appointment/appointment.socket';
import { notificationService } from '../modules/notification/notification.service';
import { logger } from '../utils/logger';

const REMINDER_WINDOW_START_MINUTES = 55;
const REMINDER_WINDOW_END_MINUTES = 65;

async function sendUpcomingAppointmentReminders(): Promise<void> {
  const windowStart = new Date(Date.now() + REMINDER_WINDOW_START_MINUTES * 60 * 1000);
  const windowEnd = new Date(Date.now() + REMINDER_WINDOW_END_MINUTES * 60 * 1000);

  const upcoming = await AppointmentModel.find({
    status: 'confirmed',
    scheduledStart: { $gte: windowStart, $lte: windowEnd },
  })
    .populate({ path: 'patientId', populate: { path: 'userId' } })
    .populate({ path: 'doctorId', populate: { path: 'userId' } })
    .exec();

  for (const appointment of upcoming) {
    const { patientUserId, doctorUserId } = participantUserIds(appointment);
    const when = appointment.scheduledStart.toLocaleString();

    if (patientUserId) {
      await notificationService.notify({
        userId: patientUserId,
        type: 'appointment_reminder',
        title: 'Upcoming appointment',
        body: `You have an appointment at ${when}, about an hour from now.`,
        relatedEntityType: 'Appointment',
        relatedEntityId: appointment._id.toString(),
      });
    }
    if (doctorUserId) {
      await notificationService.notify({
        userId: doctorUserId,
        type: 'appointment_reminder',
        title: 'Upcoming appointment',
        body: `You have an appointment at ${when}, about an hour from now.`,
        relatedEntityType: 'Appointment',
        relatedEntityId: appointment._id.toString(),
      });
    }
  }

  if (upcoming.length > 0) {
    logger.info(`Sent ${upcoming.length} appointment reminder notification(s)`);
  }
}

/** Runs every 5 minutes, looking for confirmed appointments starting in ~1 hour. */
export function scheduleAppointmentReminders(): void {
  cron.schedule('*/5 * * * *', () => {
    sendUpcomingAppointmentReminders().catch((error) => {
      logger.error(`Appointment reminder cron failed: ${(error as Error).message}`);
    });
  });
}
