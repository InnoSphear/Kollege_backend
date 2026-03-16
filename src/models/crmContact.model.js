import mongoose from 'mongoose';

const crmContactSchema = new mongoose.Schema(
  {
    counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    stage: { type: String, enum: ['lead', 'warm', 'hot', 'converted', 'lost'], default: 'lead', index: true },
    tags: [{ type: String }],
    source: { type: String, default: 'manual' },
    expectedRevenue: { type: Number, default: 0 },
    lastContactedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

crmContactSchema.index({ counselorId: 1, phone: 1 }, { unique: true });
crmContactSchema.index({ name: 'text', phone: 'text', email: 'text', tags: 'text' });

export default mongoose.model('CrmContact', crmContactSchema);
