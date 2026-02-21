import { Controller, Post, Get, Body, BadRequestException, Logger, Req, Res, Query } from '@nestjs/common';
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

class ForgotPasswordDto {
  email!: string;
}

class ResetPasswordDto {
  token!: string;
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

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new BadRequestException('token required');
    this.logger.log(`Email verification attempt token=${token.slice(0, 8)}...`);
    await this.authService.verifyEmail(token);
    this.logger.log('Email verified successfully, redirecting');
    // Redirect to frontend with success flag
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    return res.redirect(`${appUrl}/login?verified=1`);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    if (!dto.email) throw new BadRequestException('email required');
    this.logger.log(`Forgot password request for email=${dto.email}`);
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    if (!dto.token || !dto.password) throw new BadRequestException('token and password required');
    if (dto.password.length < 8) throw new BadRequestException('password too short');
    this.logger.log(`Password reset attempt token=${dto.token.slice(0, 8)}...`);
    const res = await this.authService.resetPassword(dto.token, dto.password);
    this.logger.log('Password reset completed');
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
      this.logger.debug('Token refresh: no refresh cookie present');
      return res.status(204).send();
    }
    const payload = this.authService.verifyToken(cookie);
    if (!payload || !payload.sub) {
      this.logger.warn('Token refresh: invalid or expired refresh token');
      res.clearCookie('hc_refresh');
      return res.status(204).send();
    }
    this.logger.debug(`Token refresh for userId=${payload.sub}`);
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
    this.logger.debug('Logout: clearing refresh cookie');
    res.clearCookie('hc_refresh');
    return { ok: true };
  }
}
