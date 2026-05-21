import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
      select: ['id', 'email', 'passwordHash', 'role', 'username'],
    });
  }

  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, data: Partial<User> & { password?: string }) {
    const user = await this.findById(id);

async updateUser(id: string, data: Partial<User>) {
  const user = await this.findById(id);

  const allowed = [
    'username',
    'email',
    'phoneNumber',
    'profilePicture',
    'status',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      user[key] = data[key];
    }

    // Hash and save new password if provided
    if ((data as any).password?.trim()) {
      user.passwordHash = await bcrypt.hash((data as any).password, 10);
    }

    return this.userRepo.save(user);
  }

  async findAll() {
    return this.userRepo.find({
      select: ['id', 'email', 'username', 'phoneNumber', 'profilePicture', 'role', 'status', 'emailVerifiedAt', 'lastLoginAt'],
    });
  }

  async findAllForAdmin() {
    return this.userRepo.find({
      select: ['id', 'email', 'username', 'role', 'status', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }
}