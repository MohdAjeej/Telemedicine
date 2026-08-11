import { cloudinary } from '../../config/cloudinary.config';
import { ApiError } from '../../helpers/ApiError';
import { toHospitalIdString } from '../../helpers/hospitalScope';
import { appointmentRepository } from '../appointment/appointment.repository';
import { consultationRepository } from '../consultation/consultation.repository';
import { assertVideoParticipant } from '../video/video.service';
import { recordingRepository } from './recording.repository';

function uploadVideoBuffer(buffer: Buffer): Promise<{ url: string; durationSeconds?: number }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'telemedicine/recordings',
        // Transcode/compress on upload so stored recordings don't carry the
        // raw MediaRecorder bitrate — auto quality + codec picks the smallest
        // file that still looks acceptable for playback.
        quality: 'auto:eco',
        video_codec: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve({ url: result.secure_url, durationSeconds: result.duration });
      },
    );
    stream.end(buffer);
  });
}

export const recordingService = {
  async create(input: { appointmentId: string; recordedBy: string; buffer: Buffer }) {
    const appointment = await appointmentRepository.findById(input.appointmentId);
    if (!appointment) throw ApiError.notFound('Appointment not found');
    assertVideoParticipant(appointment, input.recordedBy);

    const consultation = await consultationRepository.findByAppointmentId(input.appointmentId);
    const { url, durationSeconds } = await uploadVideoBuffer(input.buffer);

    return recordingRepository.create({
      appointmentId: input.appointmentId,
      consultationId: consultation?._id ? String(consultation._id) : undefined,
      patientId: String((appointment.patientId as { _id?: unknown })?._id ?? appointment.patientId),
      hospitalId: toHospitalIdString(appointment.hospitalId)!,
      recordedBy: input.recordedBy,
      fileUrl: url,
      durationSeconds,
    });
  },

  async listForAppointment(appointmentId: string, requestingUserId: string) {
    // Same participant check as recording (doctor or health officer on this
    // appointment), but without the "call is currently live" constraints —
    // recordings must remain listable after the appointment is completed.
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) throw ApiError.notFound('Appointment not found');
    assertVideoParticipant(appointment, requestingUserId);

    return recordingRepository.findByAppointmentId(appointmentId);
  },

  async remove(id: string, requestingUserId: string) {
    const recording = await recordingRepository.findById(id);
    if (!recording) throw ApiError.notFound('Recording not found');

    const appointment = await appointmentRepository.findById(String(recording.appointmentId));
    if (!appointment) throw ApiError.notFound('Appointment not found');
    assertVideoParticipant(appointment, requestingUserId);

    await recordingRepository.deleteById(id);
  },
};
