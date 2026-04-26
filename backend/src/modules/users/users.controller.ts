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

import { Controller, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Controller('/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }
}