import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

// exported for testing to drive the rarely-hit branches (s falsy or long strings)
export const truncate = (s?: string, n = 16) => (s ? (s.length > n ? s.slice(0, n) + '...' : s) : '');

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);
  constructor(private readonly authService: AuthService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'];
    if (!auth) {
      this.logger.warn('Authorization header missing');
      return false;
    }
    const parts = auth.split(' ');
    if (parts.length !== 2) {
      this.logger.warn(`Authorization header malformed: ${truncate(String(auth))}`);
      return false;
    }
    const token = parts[1];
    const payload = this.authService.verifyToken(token);
    if (!payload) {
      this.logger.warn(`Token verification failed for token=${truncate(token)}`);
      return false;
    }
    // attach user id
    (req as any).user = { id: payload.sub };
    this.logger.log(`Authenticated request for user=${payload.sub}`);
    return true;
  }
}
