export function createRateLimit({ windowMs = 60_000, max = 10 } = {}) {
  const hits = new Map();

  return function rateLimit(req, res, next) {
    const key = `${req.ip || req.socket?.remoteAddress || 'unknown'}:${req.path}`;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.startedAt >= windowMs) {
      hits.set(key, { count: 1, startedAt: now });
      return next();
    }

    if (entry.count >= max) {
      return res.status(429).json({
        ok: false,
        error: "Demasiados intentos. Intenta de nuevo más tarde."
      });
    }

    entry.count += 1;
    hits.set(key, entry);
    return next();
  };
}
