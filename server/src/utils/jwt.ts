import jwt from 'jsonwebtoken';
import { UserRole } from '../types/index.js';

export interface JWTPayload {
  userId: string;
  role: UserRole;
}

export class JWTUtils {
  private static readonly SECRET = process.env.JWT_SECRET || 'secret-key';
  private static readonly EXPIRES_IN = '7d';

  static generate(payload: JWTPayload): string {
    return jwt.sign(payload, this.SECRET, { expiresIn: this.EXPIRES_IN });
  }

  static verify(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}