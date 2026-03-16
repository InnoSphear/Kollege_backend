import mongoose from 'mongoose';

const crmWhatsappSessionSchema = new mongoose.Schema(
  {
    counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    whatsappNumber: { type: String, trim: true, required: true },
    status: { type: String, enum: ['active', 'disconnected', 'pending'], default: 'pending', index: true },
    qrToken: String,
    lastActiveAt: Date,
    messagesSent: { type: Number, default: 0 },
    callsLogged: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('CrmWhatsappSession', crmWhatsappSessionSchema);
