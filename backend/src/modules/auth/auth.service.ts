 

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

  
  async register(
  username: string,
  email: string,
  password: string,
  phoneNumber?: string,
  profilePicture?: string,
) {
  const exist = await this.usersService.findByEmail(email);
  if (exist) throw new BadRequestException('Email already exists');

  const hash = await bcrypt.hash(password, 10);

  return this.usersService.create({
    username,
    email,
    passwordHash: hash,
    phoneNumber,
    profilePicture,  
    role: 'customer' as any,
  });
}

  async login(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new BadRequestException('Invalid credentials');
  }

  const match = await bcrypt.compare(password, user.passwordHash);

  if (!match) {
    throw new BadRequestException('Invalid credentials');
  }

  const token = this.jwtService.sign({
    sub: user.id,
    role: user.role,
  });

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    },
    token,
  };
}
}