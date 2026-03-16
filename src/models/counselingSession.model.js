import mongoose from 'mongoose';

const counselingSessionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    mode: { type: String, enum: ['call', 'chat', 'video'], default: 'call' },
    scheduleAt: Date,
    status: { type: String, enum: ['requested', 'scheduled', 'completed', 'cancelled'], default: 'requested' },
  },
  { timestamps: true }
);

export default mongoose.model('CounselingSession', counselingSessionSchema);
