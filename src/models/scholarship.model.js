import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    provider: String,
    eligibilityCriteria: String,
    amount: Number,
    applicationLink: String,
    applicationDeadline: Date,
  },
  { timestamps: true }
);

scholarshipSchema.index({ name: 'text', provider: 'text' });

export default mongoose.model('Scholarship', scholarshipSchema);
