import mongoose from 'mongoose';

const onlineCourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    provider: String,
    category: String,
    price: Number,
    durationHours: Number,
    enrollmentLink: String,
  },
  { timestamps: true }
);

onlineCourseSchema.index({ title: 'text', provider: 'text', category: 'text' });

export default mongoose.model('OnlineCourse', onlineCourseSchema);
