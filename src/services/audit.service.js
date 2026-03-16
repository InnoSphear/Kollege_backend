import AuditLog from '../models/auditLog.model.js';

export const logAudit = async ({ req, action, resource, resourceId, status = 'success', changes = null }) => {
  try {
    await AuditLog.create({
      actorId: req.user?._id,
      actorRole: req.user?.role,
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : undefined,
      method: req.method,
      path: req.originalUrl,
      status,
      changes,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch {
    // intentionally swallow audit failures to avoid blocking primary action
  }
};
