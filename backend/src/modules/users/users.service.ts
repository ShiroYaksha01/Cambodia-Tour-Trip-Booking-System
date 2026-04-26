 
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
    return this.userRepo.findOne({ where: { id } });
  }

  async updateUser(id: string, data: Partial<User>) {
    const user = await this.findById(id);

    if (!user) throw new NotFoundException('User not found');

    const allowed = ['username', 'phoneNumber', 'profilePicture'];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        user[key] = data[key];
      }
    }

    return this.userRepo.save(user);
  }
}