import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    pattern: String,
    syllabus: String,
    eligibility: String,
    importantDates: [{ title: String, date: Date }],
    registrationLink: String,
    admitCardLink: String,
    resultLink: String,
    cutoffs: [{ year: Number, category: String, score: Number }],
  },
  { timestamps: true }
);

examSchema.index({ name: 'text', code: 'text' });

export default mongoose.model('Exam', examSchema);
