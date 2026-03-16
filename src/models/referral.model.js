import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referralCode: { type: String, required: true, index: true },
    status: { type: String, enum: ['registered', 'applied', 'admitted'], default: 'registered' },
    commissionStatus: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
    commissionAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

referralSchema.index({ counselorId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('Referral', referralSchema);
