import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db.js";
import { generateUserPdf } from "./lib/pdfExport.js";
import { createApp, validate, toApi, validateTransaction } from "../middleware/app.js";
import { setupHealthCheck } from "./routes/health.js";
import { setupAuth } from "./routes/auth.js";
import { apiLimiter, setupSecurityHeaders, validateRequest } from "./middleware/security.js";
import { requireAuth } from "./lib/auth.js";
import { requestLogger, errorLogger } from "./logger.js";
const apiApp = createApp({
  express,
  cors,
  db,
  generateUserPdf,
});
const app = express();
setupSecurityHeaders(app);
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(validateRequest);
setupHealthCheck(app);
await setupAuth(app, {
  db,
});
app.use("/api", apiLimiter);
app.use("/api", requireAuth);
app.use(apiApp);
app.use(errorLogger);
export default app;
export { validate, toApi, validateTransaction };
