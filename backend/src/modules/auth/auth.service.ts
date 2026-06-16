 

import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PasswordReset } from './entities/password-reset.entity';
import { EmailVerification } from './entities/email-verification.entity';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private configService: ConfigService,
  ) {
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');
    console.log('--- Email Config Check ---');
    console.log('EMAIL_USER:', user);
    console.log('EMAIL_PASS (length):', pass?.length);
    console.log('--------------------------');

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: user,
        pass: pass,
      },
      // Force IPv4 to avoid ENETUNREACH errors on Render/Gmail
      family: 4,
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    } as any);
  }

  async register(
    username: string,
    email: string,
    password: string,
    phoneNumber?: string,
    profilePicture?: string,
    role?: string,
  ) {
    console.log(`--- Registering user: ${email} ---`);
    const exist = await this.usersService.findByEmail(email);
    if (exist) throw new BadRequestException('Email already exists');

    const hash = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      username,
      email,
      passwordHash: hash,
      phoneNumber,
      profilePicture,
      role: (role ?? 'customer') as any,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.emailVerificationRepository.save({
      email,
      otp,
      expiresAt,
    });

    try {
      console.log(`Attempting to send verification email to: ${email}`);
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Welcome! Verify your email',
        text: `Your OTP for email verification is: ${otp}. It expires in 10 minutes.`,
      });
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed during registration:', emailError);
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isVerified = user.isEmailVerified || user.emailVerifiedAt;

    if (!isVerified) {
      throw new BadRequestException(
        'Please verify your email before logging in',
      );
    }

    // Sync emailVerifiedAt if it's null but isEmailVerified is true
    if (user.isEmailVerified && !user.emailVerifiedAt) {
      await this.usersService.verifyEmail(email);
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      token,
    };
  }

  async resendVerificationOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('User not found');
    if (user.isEmailVerified || user.emailVerifiedAt)
      return { message: 'Email is already verified' };

    // Invalidate old OTPs
    await this.emailVerificationRepository.update(
      { email, isUsed: false },
      { isUsed: true },
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.emailVerificationRepository.save({
      email,
      otp,
      expiresAt,
    });

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Verify your email',
        text: `Your new OTP for email verification is: ${otp}. It expires in 10 minutes.`,
      });
    } catch (emailError) {
      console.error('Email resend failed:', emailError);
    }

    return { success: true };
  }

  async verifyRegistrationEmail(email: string, otp: string) {
    const verificationRecord = await this.emailVerificationRepository.findOne({
      where: { email, otp, isUsed: false },
    });

    if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.emailVerificationRepository.update({ id: verificationRecord.id }, { isUsed: true });
    await this.usersService.verifyEmail(email);

    return { success: true };
  }

  async forgotPassword(email: string) {
    console.log(`--- forgotPassword called for: ${email} ---`);
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
        console.log(`Attempting to send password reset email to: ${email}`);
        await this.transporter.sendMail({
          from: this.configService.get<string>('EMAIL_USER'),
          to: email,
          subject: 'Password Reset OTP',
          text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
        });
        console.log('Password reset email sent successfully');
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