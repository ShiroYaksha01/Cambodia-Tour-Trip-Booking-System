 
import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
 
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseService } from '../../common/services/supabase.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
  ) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async register(
    @UploadedFile() file: any,
    @Body() dto: RegisterDto,
  ) {
    let profilePictureUrl: string | undefined = undefined;
    if (file) {
      profilePictureUrl = await this.supabaseService.uploadImage(file, 'users');
    }

    return this.authService.register(
      dto.username,
      dto.email,
      dto.password,
      dto.phoneNumber,
      profilePictureUrl,
      dto.role,
    );
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}