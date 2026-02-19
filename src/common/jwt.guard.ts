import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'];
    if (!auth) return false;
    const parts = auth.split(' ');
    if (parts.length !== 2) return false;
    const token = parts[1];
    const payload = this.authService.verifyToken(token);
    if (!payload) return false;
    // attach user id
    (req as any).user = { id: payload.sub };
    return true;
  }
}
