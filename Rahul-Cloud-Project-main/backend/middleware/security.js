import rateLimit from "express-rate-limit";
import helmet from "helmet";
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    process.env.RATE_LIMIT_DISABLED === "true" || ["/health", "/ready", "/live"].includes(req.path),
});
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many accounts created from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
export function setupSecurityHeaders(app) {
  app.use(helmet());
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
}
export function validateRequest(req, res, next) {
  const maxSize = 10 * 1024;
  const contentLength = parseInt(req.headers["content-length"], 10);
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: "Payload too large",
    });
  }
  next();
}
