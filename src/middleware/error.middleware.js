import { ApiError } from '../utils/apiError.js';

export const notFoundHandler = (req, res, _next) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    details: null,
  });
};

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
