import mongoose from 'mongoose';

const counselorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    referralCode: { type: String, unique: true, required: true, index: true },
    whatsappNumber: { type: String, trim: true },
    whatsappEnabled: { type: Boolean, default: false, index: true },
    isAdminCounselor: { type: Boolean, default: false, index: true },
    commissionEarned: { type: Number, default: 0 },
    commissionPending: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('CounselorProfile', counselorProfileSchema);
