 

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(data: Partial<User>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'role'],
    });
  }

 async findById(id: string) {
  const user = await this.userRepo.findOne({ where: { id } });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}

async updateUser(id: string, data: Partial<User>) {
  const user = await this.findById(id);

  const allowed = [
    'username',
    'phoneNumber',
    'profilePicture',
    'status',
    'role',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      user[key] = data[key];
    }
  }

  return this.userRepo.save(user);
}
 
  async findAll() {
    return this.userRepo.find({
      select: ['id', 'email', 'username', 'phoneNumber', 'profilePicture', 'role', 'status', 'emailVerifiedAt', 'lastLoginAt'],
    });
  }
}