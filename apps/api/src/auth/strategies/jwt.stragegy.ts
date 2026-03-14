import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET') || 'default_secret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    const { sub } = payload;
    const user = await this.usersService.findOneById(sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.deletedAt !== null) {
      throw new UnauthorizedException(
        'User account is inactive, please contact support',
      );
    }
    return user;
  }
}
