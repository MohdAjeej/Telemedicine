import { Schema, model, type HydratedDocument } from 'mongoose';

export interface VitalDocument {
  _id: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  hospitalId: Schema.Types.ObjectId;
  recordedBy: Schema.Types.ObjectId;
  recordedAt: Date;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  bloodSugar?: number;
  symptoms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedVital = HydratedDocument<VitalDocument>;

const vitalSchema = new Schema<VitalDocument>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordedAt: { type: Date, default: () => new Date() },
    bloodPressureSystolic: { type: Number },
    bloodPressureDiastolic: { type: Number },
    heartRate: { type: Number },
    temperature: { type: Number },
    respiratoryRate: { type: Number },
    oxygenSaturation: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    bmi: { type: Number },
    bloodSugar: { type: Number },
    symptoms: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

vitalSchema.pre('save', function computeBmi(next) {
  if (this.weight && this.height) {
    const heightMeters = this.height / 100;
    this.bmi = Number((this.weight / (heightMeters * heightMeters)).toFixed(1));
  }
  next();
});

export const VitalModel = model<VitalDocument>('Vital', vitalSchema);
