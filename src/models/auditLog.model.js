import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    actorRole: String,
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    method: String,
    path: String,
    status: String,
    changes: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
