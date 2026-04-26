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

import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, email: string, password: string) {
    const exist = await this.usersService.findByEmail(email);
    if (exist) throw new BadRequestException('Email already exists');

    const hash = await bcrypt.hash(password, 10);

    return this.usersService.create({
      username,
      email,
      passwordHash: hash,
      role: 'customer' as any, // Default role
    });
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid credentials');

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new BadRequestException('Invalid credentials');

    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return { access_token: token };
  }
}