import mongoose from 'mongoose';

const crmCallLogSchema = new mongoose.Schema(
  {
    counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmContact', required: true, index: true },
    direction: { type: String, enum: ['inbound', 'outbound'], default: 'outbound', index: true },
    durationSec: { type: Number, default: 0 },
    status: { type: String, enum: ['connected', 'missed', 'busy', 'failed'], default: 'connected', index: true },
    autoDialed: { type: Boolean, default: false },
    notes: String,
    recordingUrl: String,
  },
  { timestamps: true }
);

crmCallLogSchema.index({ counselorId: 1, createdAt: -1 });

export default mongoose.model('CrmCallLog', crmCallLogSchema);
