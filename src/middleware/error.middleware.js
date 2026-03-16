import { ApiError } from '../utils/apiError.js';

export const notFoundHandler = (_req, _res, next) => next(new ApiError(404, 'Route not found'));

export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message,
    details: err.details || null,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};
