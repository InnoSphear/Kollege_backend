import mongoose from 'mongoose';

const crmMessageSchema = new mongoose.Schema(
  {
    counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmContact', required: true, index: true },
    channel: { type: String, enum: ['whatsapp', 'sms', 'email'], default: 'whatsapp', index: true },
    direction: { type: String, enum: ['inbound', 'outbound'], default: 'outbound', index: true },
    templateName: String,
    content: { type: String, required: true },
    status: { type: String, enum: ['queued', 'sent', 'delivered', 'failed', 'read'], default: 'sent', index: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

crmMessageSchema.index({ counselorId: 1, createdAt: -1 });

export default mongoose.model('CrmMessage', crmMessageSchema);
