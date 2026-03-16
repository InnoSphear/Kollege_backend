import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    marks10: Number,
    marks12: Number,
    examScores: [{ exam: String, score: Number, percentile: Number }],
    preferredCourses: [String],
    preferredCity: [String],
    budget: Number,
    referralCodeUsed: String,
  },
  { timestamps: true }
);

export default mongoose.model('StudentProfile', studentProfileSchema);
