import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    stream: { type: String, index: true },
    duration: String,
    eligibility: String,
    careerScope: String,
    averageSalary: Number,
    requiredExams: [String],
    topColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
  },
  { timestamps: true }
);

courseSchema.index({ name: 'text', stream: 'text' });

export default mongoose.model('Course', courseSchema);
