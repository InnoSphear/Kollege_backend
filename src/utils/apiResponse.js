export const ok = (res, data, message = 'ok', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};
