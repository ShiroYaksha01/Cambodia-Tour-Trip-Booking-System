import {
  Controller,
  Put,
  Param,
  Body,
  UseGuards,
  Get,
  UploadedFile,
  UseInterceptors,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { SupabaseService } from '../../common/services/supabase.service';

@Controller('/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private supabaseService: SupabaseService,
  ) {}
 
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async updateUser(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body() dto: UpdateUserDto,
    @Request() req: any,
  ) {
    // Security: Only admins can change 'status'
    const isAdmin = req.user?.role === 'admin';
    const updateData: any = { ...dto };

    if (!isAdmin) {
      delete updateData.status;
      
      // Also, non-admins should only be able to update their own profile
      if (req.user.userId !== id) {
        throw new ForbiddenException('You can only update your own profile');
      }
    }

    let profilePictureUrl = updateData.profilePicture;
    if (file) {
      profilePictureUrl = await this.supabaseService.uploadImage(file, 'users');
    }

    return this.usersService.updateUser(id, {
      ...updateData,
      profilePicture: profilePictureUrl,  
    });
  }

   
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}