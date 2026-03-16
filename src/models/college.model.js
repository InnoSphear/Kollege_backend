import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    city: { type: String, index: true },
    state: { type: String, index: true },
    country: { type: String, default: 'India', index: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    examsAccepted: [String],
    feesMin: Number,
    feesMax: Number,
    avgPackage: Number,
    ranking: Number,
    rating: Number,
    overview: String,
    admissionProcess: String,
    placementStats: String,
    infrastructure: String,
    contact: {
      website: String,
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

collegeSchema.index({ name: 'text', city: 'text', state: 'text', country: 'text' });

export default mongoose.model('College', collegeSchema);
