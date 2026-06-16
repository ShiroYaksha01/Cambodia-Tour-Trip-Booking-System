 

import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Resend } from 'resend';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PasswordReset } from './entities/password-reset.entity';
import { EmailVerification } from './entities/email-verification.entity';

@Injectable()
export class AuthService {
  private resend: Resend;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private configService: ConfigService,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    console.log('--- Resend Config Check ---');
    console.log('RESEND_API_KEY (length):', resendApiKey?.length);
    console.log('--------------------------');

    this.resend = new Resend(resendApiKey || 'dummy_key_to_prevent_crash');
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
      const { data, error } = await this.resend.emails.send({
        from: 'Anajak Tour <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome! Verify your email',
        text: `Your OTP for email verification is: ${otp}. It expires in 10 minutes.`,
      });

      if (error) {
        console.error('Resend error during registration:', error);
      } else {
        console.log('Verification email sent successfully:', data?.id);
      }
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
      console.log(`Attempting to resend verification email to: ${email}`);
      const { data, error } = await this.resend.emails.send({
        from: 'Anajak Tour <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your email',
        text: `Your new OTP for email verification is: ${otp}. It expires in 10 minutes.`,
      });

      if (error) {
        console.error('Resend error during resendVerificationOtp:', error);
      } else {
        console.log('Verification email resent successfully:', data?.id);
      }
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
        const { data, error } = await this.resend.emails.send({
          from: 'Anajak Tour <onboarding@resend.dev>',
          to: email,
          subject: 'Password Reset OTP',
          text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
        });

        if (error) {
          console.error('Resend error during forgotPassword:', error);
        } else {
          console.log('Password reset email sent successfully:', data?.id);
        }
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