import {
  ensureAuthSchema,
  verifyCredentials,
  registerUser,
  signToken,
  requireAuth,
  publicUser,
  REGISTRATION_ENABLED,
} from "../lib/auth.js";
import { authLimiter, registerLimiter } from "../middleware/security.js";
export async function setupAuth(app, { db }) {
  await ensureAuthSchema(db);
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    const { email, password } = req.body || {};
    const user = await verifyCredentials(db, email, password);
    if (!user)
      return res.status(401).json({
        message: "Invalid email or password",
      });
    res.json({
      token: signToken(user),
      user: publicUser(user),
    });
  });
  app.post("/api/auth/register", registerLimiter, async (req, res) => {
    if (!REGISTRATION_ENABLED) {
      return res.status(403).json({
        message: "Registration is disabled",
      });
    }
    const { email, password } = req.body || {};
    const result = await registerUser(db, email, password);
    if (result.errors) {
      const status = result.errors.email === "Email already in use" ? 409 : 400;
      return res.status(status).json({
        message: Object.values(result.errors)[0],
        errors: result.errors,
      });
    }
    res.status(201).json({
      token: signToken(result.user),
      user: publicUser(result.user),
    });
  });
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const { rows } = await db("SELECT * FROM auth_users WHERE id = ?", [req.user.sub]);
    const row = rows[0];
    if (!row)
      return res.status(401).json({
        message: "Account no longer exists",
      });
    res.json({
      user: publicUser(row),
    });
  });
}
