import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_VALUES } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true, index: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLE_VALUES, required: true, index: true },
    language: { type: String, default: 'en' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function save() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(raw) {
  return bcrypt.compare(raw, this.password);
};

userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });

export default mongoose.model('User', userSchema);
