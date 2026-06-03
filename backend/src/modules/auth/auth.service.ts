 

import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PasswordReset } from './entities/password-reset.entity';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    private configService: ConfigService,
  ) {
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');
    console.log('--- Email Config Check ---');
    console.log('EMAIL_USER:', user);
    console.log('EMAIL_PASS (length):', pass?.length);
    console.log('--------------------------');

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass,
      },
    });
  }

  async register(
    username: string,
    email: string,
    password: string,
    phoneNumber?: string,
    profilePicture?: string,
    role?: string,
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
      role: (role ?? 'customer') as any,
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

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      const message = 'If this email exists, we sent a verification code.';
      
      if (!user) {
        return { message };
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await this.passwordResetRepository.save({
        email,
        otp,
        expiresAt,
      });

      try {
        await this.transporter.sendMail({
          from: this.configService.get<string>('EMAIL_USER'),
          to: email,
          subject: 'Password Reset OTP',
          text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      return { message };
    } catch (err) {
      console.error('CRITICAL ERROR IN forgotPassword:', err);
      throw err;
    }
  }

  async verifyOtp(email: string, otp: string) {
    const resetRecord = await this.passwordResetRepository.findOne({
      where: { email, otp, isUsed: false },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return { success: true };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    await this.verifyOtp(email, otp);

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const hash = await bcrypt.hash(newPassword, 10);
    
    await this.usersService.updatePassword(user.id, hash);
    
    await this.passwordResetRepository.update({ email, otp }, { isUsed: true });

    return { success: true };
  }
}