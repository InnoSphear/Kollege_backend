import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { verifyToken } from '../utils/jwt.js';

export const auth = async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) return next(new ApiError(401, 'Unauthorized'));

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select('-password');
    if (!user) return next(new ApiError(401, 'Unauthorized'));
    req.user = user;
    next();
  } catch {
    next(new ApiError(401, 'Invalid token'));
  }
};

export const permit = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden'));
  }
  next();
};
