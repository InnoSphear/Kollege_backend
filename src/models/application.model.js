import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'admitted'],
      default: 'submitted',
      index: true,
    },
    documents: [{ docType: String, fileUrl: String }],
    referralCounselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    commissionStatus: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
    commissionAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, collegeId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
