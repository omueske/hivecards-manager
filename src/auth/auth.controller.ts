import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
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
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    if (!dto.email || !dto.password) throw new BadRequestException('email and password required');
    return this.authService.register(dto.email, dto.password, dto.username);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new BadRequestException('invalid credentials');
    return this.authService.signTokens(user._id.toString());
  }
}
