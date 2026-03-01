import { Request, Response, NextFunction } from "express";
import { JWTUtils, JWTPayload } from "../utils/jwt";
import { UserRole } from "../types";

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token = req.cookies.token || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ message: "Неавторизован" });
  }

  const payload = JWTUtils.verify(token);

  if (!payload) {
    return res.status(401).json({ message: "Недействительный токен" });
  }

  req.user = payload;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Неавторизован" });
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    next();
  };
}
