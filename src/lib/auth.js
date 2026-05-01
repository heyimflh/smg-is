// ============================================================
// SMG-IS v2.0 — Auth Utility
// JWT-based authentication helpers
// ============================================================
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SECRET = process.env.NEXTAUTH_SECRET || "smg-is-fallback-secret";

export async function authenticateUser(username, password) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return { id: user.id, name: user.name, username: user.username, role: user.role };
}

export function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, username: user.username, role: user.role },
    SECRET,
    { expiresIn: "8h" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function getSession(request) {
  const cookie = request.cookies?.get?.("smg_token")?.value;
  const authHeader = request.headers.get("authorization");
  const token = cookie || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(request) {
  const session = getSession(request);
  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }
  return { session };
}

export function requireAdmin(request) {
  const result = requireAuth(request);
  if (result.error) return result;
  if (result.session.role !== "admin") {
    return { error: "Forbidden — Admin only", status: 403 };
  }
  return result;
}
