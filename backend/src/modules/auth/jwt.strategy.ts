// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: 'secretKey123',
//     });
//   }

//   async validate(payload: any) {
//     console.log('JWT HIT:', payload); // should appear now
//     return payload;
//   }
// }
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AccountStatus } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-key-12345',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub).catch(() => null);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status === AccountStatus.SUSPENDED || user.status === AccountStatus.INACTIVE) {
      throw new UnauthorizedException('User account is suspended or inactive');
    }

    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}