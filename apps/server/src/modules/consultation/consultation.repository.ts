import { ConsultationModel, type HydratedConsultation } from './consultation.model';

export const consultationRepository = {
  create(input: {
    appointmentId: string;
    doctorId: string;
    patientId: string;
    chiefComplaint?: string;
    videoRoomId?: string;
  }): Promise<HydratedConsultation> {
    return ConsultationModel.create({ ...input, startedAt: new Date() });
  },

  findById(id: string): Promise<HydratedConsultation | null> {
    return ConsultationModel.findById(id).populate('doctorId patientId appointmentId').exec();
  },

  findByAppointmentId(appointmentId: string): Promise<HydratedConsultation | null> {
    return ConsultationModel.findOne({ appointmentId }).exec();
  },

  async findMany(filter: { doctorId?: string; patientId?: string; page?: number; limit?: number }) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const query: Record<string, unknown> = {};
    if (filter.doctorId) query.doctorId = filter.doctorId;
    if (filter.patientId) query.patientId = filter.patientId;

    const [items, total] = await Promise.all([
      ConsultationModel.find(query)
        .populate('doctorId patientId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      ConsultationModel.countDocuments(query),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },

  update(
    id: string,
    input: { chiefComplaint?: string; diagnosis?: string; notes?: string; followUpRequired?: boolean; followUpDate?: string },
  ): Promise<HydratedConsultation | null> {
    return ConsultationModel.findByIdAndUpdate(id, { $set: input }, { new: true }).exec();
  },

  complete(id: string): Promise<HydratedConsultation | null> {
    return ConsultationModel.findByIdAndUpdate(
      id,
      { $set: { status: 'completed', endedAt: new Date() } },
      { new: true },
    ).exec();
  },
};
