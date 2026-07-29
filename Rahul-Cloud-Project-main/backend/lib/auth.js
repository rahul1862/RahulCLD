import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Secrets and demo credentials are environment-driven. The defaults exist so the
// app runs out-of-the-box for local dev, tests and the public portfolio demo —
// production deployments MUST override JWT_SECRET / ADMIN_PASSWORD.
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
const BCRYPT_ROUNDS = 10;

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@userhub.dev").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "userhub-demo";
const MIN_PASSWORD_LENGTH = 8;

// Public self-registration is on by default (this is a public demo). Set
// ALLOW_REGISTRATION=false to lock the app down to the seeded admin only.
export const REGISTRATION_ENABLED = process.env.ALLOW_REGISTRATION !== "false";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  // Don't crash the process — just make the misconfiguration loud.
  console.warn("[auth] JWT_SECRET is not set; falling back to an insecure default. Set JWT_SECRET in the environment.");
}

const normalizeEmail = (email) => String(email || "").toLowerCase().trim();

/** Create the auth_users table (idempotent) and seed the demo admin if absent. */
export async function ensureAuthSchema(db) {
  await db(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      "createdAt" TEXT NOT NULL
    )
  `);

  const { rows } = await db("SELECT id FROM auth_users WHERE email = ?", [ADMIN_EMAIL]);
  if (!rows[0]) {
    await db(
      'INSERT INTO auth_users (id, email, "passwordHash", role, "createdAt") VALUES (?, ?, ?, ?, ?)',
      [crypto.randomUUID(), ADMIN_EMAIL, bcrypt.hashSync(ADMIN_PASSWORD, BCRYPT_ROUNDS), "admin", new Date().toISOString()]
    );
  }
}

export async function findUserByEmail(db, email) {
  const { rows } = await db("SELECT * FROM auth_users WHERE email = ?", [normalizeEmail(email)]);
  return rows[0];
}

/** Return the user row on valid credentials, otherwise null. Timing-safe via bcrypt. */
export async function verifyCredentials(db, email, password) {
  const user = await findUserByEmail(db, email);
  if (!user) return null;
  return bcrypt.compareSync(String(password || ""), user.passwordHash) ? user : null;
}

/**
 * Create a new login account. Returns { user } on success or { errors } on
 * validation failure / duplicate email — mirrors the { message, errors }
 * shape the rest of the API uses (see middleware/app.js's validate()).
 */
export async function registerUser(db, email, password) {
  const normalized = normalizeEmail(email);
  const errors = {};
  if (!normalized || !/^\S+@\S+\.\S+$/.test(normalized)) errors.email = "Enter a valid email address";
  if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
    errors.password = `Must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (Object.keys(errors).length) return { errors };

  if (await findUserByEmail(db, normalized)) return { errors: { email: "Email already in use" } };

  const user = {
    id: crypto.randomUUID(),
    email: normalized,
    passwordHash: bcrypt.hashSync(String(password), BCRYPT_ROUNDS),
    role: "user",
    createdAt: new Date().toISOString(),
  };
  await db(
    'INSERT INTO auth_users (id, email, "passwordHash", role, "createdAt") VALUES (?, ?, ?, ?, ?)',
    [user.id, user.email, user.passwordHash, user.role, user.createdAt]
  );
  return { user };
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/** Express middleware: rejects requests without a valid `Authorization: Bearer <jwt>`. */
export function requireAuth(req, res, next) {
  const [scheme, token] = String(req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/** Shape a stored auth_users row for the API (never leak the password hash). */
export const publicUser = (row) => ({ id: row.id, email: row.email, role: row.role });
