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

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'secretKey123',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}