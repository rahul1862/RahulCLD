export function setupHealthCheck(app) {
  app.get("/health", (req, res) => {
    try {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.APP_VERSION || "1.0.0",
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });
  app.get("/ready", (req, res) => {
    try {
      res.json({
        ready: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        ready: false,
        error: error.message,
      });
    }
  });
  app.get("/live", (req, res) => {
    res.json({
      alive: true,
      pid: process.pid,
      timestamp: new Date().toISOString(),
    });
  });
}
