import { Controller, Post, Body, BadRequestException, Logger } from '@nestjs/common';
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
  async login(@Body() dto: LoginDto) {
    this.logger.log(`Login attempt for email=${dto.email}`);
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      this.logger.warn(`Login failed for email=${dto.email}`);
      throw new BadRequestException('invalid credentials');
    }
    const tokens = this.authService.signTokens(user._id.toString());
    this.logger.log(`Login successful for userId=${user._id.toString()}`);
    return tokens;
  }
}
