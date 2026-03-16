import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', index: true },
    counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    source: String,
    status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'lost'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);
