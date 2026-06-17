 

import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { google } from 'googleapis';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PasswordReset } from './entities/password-reset.entity';
import { EmailVerification } from './entities/email-verification.entity';

@Injectable()
export class AuthService {
  private oAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private configService: ConfigService,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GMAIL_CLIENT_ID'),
      this.configService.get<string>('GMAIL_CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground'
    );
    this.oAuth2Client.setCredentials({ 
      refresh_token: this.configService.get<string>('GMAIL_REFRESH_TOKEN') 
    });
  }

  private async sendEmail(to: string, subject: string, text: string) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
      
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: Anajak Tour <sethaonthemix@gmail.com>`,
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        '',
        text,
      ];
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });
      console.log('Email sent successfully via Gmail API');
    } catch (error) {
      console.error('Failed to send email via Gmail API:', error);
      throw error;
    }
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
    const registrationData = {
      username,
      email,
      passwordHash: hash,
      phoneNumber,
      profilePicture,
      role: (role ?? 'customer') as any,
    };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.emailVerificationRepository.save({
      email,
      otp,
      expiresAt,
      registrationData,
    });

    try {
      console.log(`Attempting to send verification email to: ${email}`);
      await this.sendEmail(
        email, 
        'Welcome! Verify your email', 
        `Your OTP for email verification is: ${otp}. It expires in 10 minutes.`
      );
    } catch (emailError) {
      console.error('Email sending failed during registration:', emailError);
      console.log(`[LOCAL DEV] Registration OTP for ${email} is: ${otp}`);
    }

    return { success: true, message: 'OTP sent for verification' };
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
    if (user && (user.isEmailVerified || user.emailVerifiedAt)) {
      return { message: 'Email is already verified' };
    }

    const latestVerification = await this.emailVerificationRepository.findOne({
      where: { email },
      order: { createdAt: 'DESC' }
    });

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
      registrationData: latestVerification?.registrationData,
    });

    try {
      console.log(`Attempting to resend verification email to: ${email}`);
      await this.sendEmail(
        email,
        'Verify your email',
        `Your new OTP for email verification is: ${otp}. It expires in 10 minutes.`
      );
    } catch (emailError) {
      console.error('Email resend failed:', emailError);
      console.log(`[LOCAL DEV] Resend OTP for ${email} is: ${otp}`);
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

    if (verificationRecord.registrationData) {
      const exist = await this.usersService.findByEmail(email);
      if (!exist) {
        const userToCreate = {
          ...verificationRecord.registrationData,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        };
        await this.usersService.create(userToCreate);
      } else {
        await this.usersService.verifyEmail(email);
      }
    } else {
      await this.usersService.verifyEmail(email);
    }

    await this.emailVerificationRepository.update({ id: verificationRecord.id }, { isUsed: true });

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
        await this.sendEmail(
          email,
          'Password Reset OTP',
          `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
        );
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