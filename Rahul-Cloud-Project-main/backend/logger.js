import pino from "pino";
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
  base: {
    env: process.env.NODE_ENV || "development",
    version: process.env.APP_VERSION || "1.0.0",
  },
});
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "error" : "info";
    logger[logLevel](
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
      `${req.method} ${req.path}`
    );
  });
  next();
}
export function errorLogger(err, req, res, next) {
  logger.error(
    {
      error: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
    },
    "Request error"
  );
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}
export const log = {
  info: (message, data = {}) => logger.info(data, message),
  error: (message, data = {}) => logger.error(data, message),
  warn: (message, data = {}) => logger.warn(data, message),
  debug: (message, data = {}) => logger.debug(data, message),
};
export default logger;
