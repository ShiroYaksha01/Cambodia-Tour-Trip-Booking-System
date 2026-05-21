// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';

// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { User } from '../users/entities/user.entity';
// import { JwtStrategy } from './jwt.strategy';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([User]),

//     PassportModule.register({ defaultStrategy: 'jwt' }), // 🔥 MUST

//     JwtModule.register({
//       secret: 'secretKey123',
//       signOptions: { expiresIn: '1d' },
//     }),
//   ],
//   controllers: [AuthController],
//   providers: [AuthService, JwtStrategy],
//   exports: [PassportModule, JwtModule], // 🔥 IMPORTANT
// })
// export class AuthModule {}

import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') as string,
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1d') as any
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}