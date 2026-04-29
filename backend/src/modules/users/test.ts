// ##module/Auth
// -auth/auth.controller
// import { Controller, Post, Body } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { RegisterDto } from './dto/register.dto';
// import { LoginDto } from './dto/login.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   @Post('register')
//   register(@Body() dto: RegisterDto) {
//     return this.authService.register(dto.name, dto.email, dto.password);
//   }

//   @Post('login')
//   login(@Body() dto: LoginDto) {
//     return this.authService.login(dto.email, dto.password);
//   }
// }
// -auth/AuthController.service
// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import { JwtService } from '@nestjs/jwt';
// import { User } from '../users/entities/user.entity';

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(User)
//     private userRepo: Repository<User>,
//     private jwtService: JwtService,
//   ) {}

//   async register(name: string, email: string, password: string) {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = this.userRepo.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     return this.userRepo.save(user);
//   }

//   async login(email: string, password: string) {
//     const user = await this.userRepo.findOne({ where: { email } });

//     if (!user) return { message: 'User not found' };

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) return { message: 'Invalid password' };

//     const token = this.jwtService.sign({
//       id: user.id,
//       email: user.email,
//     });

//     return { access_token: token };
//   }
// }
// -auth module
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
// for dto in auth u can help me to write it what should i put in 

// ## user
// -am not yet have dto in my user 
// -user controller 
// import { Controller, Put, Param, Body } from '@nestjs/common';
// import { UserService } from './users.service';
// import { UpdateUserDto } from '../auth/dto/update-user.dto';
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// @Controller('users')
// export class UserController {
//   constructor(private readonly userService: UserService) {}
//   @UseGuards(JwtAuthGuard)
//   @Put(':id')
//   updateUser(
//     @Param('id') id: string,
//     @Body() updateUserDto: UpdateUserDto,
//   ) {
//     return this.userService.updateUser(Number(id), updateUserDto);
//   }
// }
// -user module
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from './entities/user.entity';
// import { UserService } from './users.service';
// import { UserController } from './users.controller';

// @Module({
//   imports: [TypeOrmModule.forFeature([User])],
//   controllers: [UserController],
//   providers: [UserService],
// })
// export class UsersModule {}
//  -user service
  
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from './entities/user.entity';
// import { UpdateUserDto } from '../auth/dto/update-user.dto';

// @Injectable()
// export class UserService {
//   constructor(
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//   ) {}

//   // UPDATE USER NAME ONLY
//   async updateUser(id: number, updateUserDto: UpdateUserDto) {
//     const user = await this.userRepository.findOne({
//       where: { id },
//     });

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     // update only name
//     if (updateUserDto.name) {
//       user.name = updateUserDto.name;
//     }

//     return await this.userRepository.save(user);
//   }
// } 
// - and this the new user entity that i have just edited please help me to fix those code to be able use this new user entity
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   OneToOne,
// } from 'typeorm';
// import { Provider } from './provider.entity';

// export enum UserRole {
//   ADMIN = 'admin',
//   PROVIDER = 'provider',
//   CUSTOMER = 'customer',
// }

// export enum AccountStatus {
//   ACTIVE = 'active',
//   INACTIVE = 'inactive',
//   SUSPENDED = 'suspended',
// }

// @Entity('users')
// export class User {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({
//     type: 'enum',
//     enum: UserRole,
//   })
//   role: UserRole;

//   @Column({ length: 60, unique: true })
//   username: string;

//   @Column({ length: 150, unique: true })
//   email: string;

//   @Column({ name: 'phone_number', length: 20, nullable: true })
//   phoneNumber: string;

//   @Column({ name: 'password_hash', type: 'text' })
//   passwordHash: string;

//   @Column({ name: 'profile_picture', type: 'text', nullable: true })
//   profilePicture: string;

//   @Column({
//     type: 'enum',
//     enum: AccountStatus,
//     default: AccountStatus.ACTIVE,
//   })
//   status: AccountStatus;

//   @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
//   emailVerifiedAt: Date;

//   @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
//   lastLoginAt: Date;

//   @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
//   createdAt: Date;

//   @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
//   updatedAt: Date;

//   @OneToOne(() => Provider, (provider) => provider.user)
//   provider: Provider;
// }
