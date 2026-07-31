import { Schema, model, type HydratedDocument } from 'mongoose';

export interface HospitalDocument {
  _id: Schema.Types.ObjectId;
  name: string;
  registrationNumber: string;
  type: 'clinic' | 'hospital' | 'multi_specialty';
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact: {
    phone?: string;
    email: string;
    website?: string;
  };
  departments: string[];
  adminIds: Schema.Types.ObjectId[];
  status: 'active' | 'inactive';
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedHospital = HydratedDocument<HospitalDocument>;

const hospitalSchema = new Schema<HospitalDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['clinic', 'hospital', 'multi_specialty'], required: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    contact: {
      // Only email is guaranteed at registration time (registerAdmin only
      // collects hospitalName/email/password) — phone/website are filled in
      // later via the Hospital Profile screen.
      phone: { type: String },
      email: { type: String, required: true },
      website: String,
    },
    departments: { type: [String], default: [] },
    adminIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    logoUrl: String,
  },
  { timestamps: true },
);

hospitalSchema.index({ name: 'text' });

export const HospitalModel = model<HospitalDocument>('Hospital', hospitalSchema);
