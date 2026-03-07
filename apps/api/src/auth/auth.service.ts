import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerAuthDto: RegisterAuthDto) {
    const user = await this.usersService.create({
      ...registerAuthDto,
      role: 'USER',
    });
    return { user, token: this.getJwtToken({ sub: user.id }) };
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.usersService.findOneByEmail(loginAuthDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { user, token: this.getJwtToken({ sub: user.id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
