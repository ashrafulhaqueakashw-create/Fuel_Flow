import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function signToken(payload: object, opts = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h", ...(opts as any) });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}
