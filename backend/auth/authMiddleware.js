import login from "./login.js";

function obtenerBearerToken(header = "") {
  const value = String(header || "");
  if (!value.startsWith("Bearer ")) return null;
  return value.slice(7).trim() || null;
}

export function optionalAuth(req, _res, next) {
  const token = obtenerBearerToken(req.headers.authorization);
  req.auth = token ? login.validarToken(token) : null;
  req.authToken = token;
  next();
}

export function requireAuth(req, res, next) {
  const token = obtenerBearerToken(req.headers.authorization);
  const auth = token ? login.validarToken(token) : null;

  if (!auth) {
    return res.status(401).json({ ok: false, error: "Autenticación requerida" });
  }

  req.auth = auth;
  req.authToken = token;
  return next();
}
