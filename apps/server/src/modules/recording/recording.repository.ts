import { RecordingModel, type HydratedRecording } from './recording.model';

export const recordingRepository = {
  create(input: {
    appointmentId: string;
    consultationId?: string;
    patientId: string;
    hospitalId: string;
    recordedBy: string;
    fileUrl: string;
    durationSeconds?: number;
  }): Promise<HydratedRecording> {
    return RecordingModel.create(input);
  },

  findByAppointmentId(appointmentId: string): Promise<HydratedRecording[]> {
    return RecordingModel.find({ appointmentId }).sort({ createdAt: -1 }).exec();
  },
};
