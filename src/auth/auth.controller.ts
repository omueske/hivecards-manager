import { Controller, Post, Body, BadRequestException, Logger, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

class RegisterDto {
  email!: string;
  password!: string;
  username?: string;
}

class LoginDto {
  email!: string;
  password!: string;
}

@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    if (!dto.email || !dto.password) throw new BadRequestException('email and password required');
    this.logger.log(`Register attempt for email=${dto.email}`);
    const res = await this.authService.register(dto.email, dto.password, dto.username);
    this.logger.log(`Registered user id=${res.id} email=${res.email}`);
    return res;
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    this.logger.log(`Login attempt for email=${dto.email}`);
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      this.logger.warn(`Login failed for email=${dto.email}`);
      throw new BadRequestException('invalid credentials');
    }
    const tokens = this.authService.signTokens(user._id.toString());
    this.logger.log(`Login successful for userId=${user._id.toString()}`);
    // set refresh token as httpOnly cookie
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('hc_refresh', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies?.hc_refresh;
    if (!cookie) {
      // No refresh cookie present — return No Content so clients know there's nothing to refresh.
      return res.status(204).send();
    }
    const payload = this.authService.verifyToken(cookie);
    if (!payload || !payload.sub) {
      // Invalid refresh token: clear cookie and return 204 to avoid noisy client errors.
      res.clearCookie('hc_refresh');
      return res.status(204).send();
    }
    const tokens = this.authService.signTokens(payload.sub as string);
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('hc_refresh', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('hc_refresh');
    return { ok: true };
  }
}
