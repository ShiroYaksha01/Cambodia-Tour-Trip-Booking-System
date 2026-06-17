 

import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BrevoClient } from '@getbrevo/brevo';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PasswordReset } from './entities/password-reset.entity';
import { EmailVerification } from './entities/email-verification.entity';

@Injectable()
export class AuthService {
  private brevoClient: BrevoClient;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private configService: ConfigService,
  ) {
    const brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
    console.log('--- Brevo Config Check ---');
    console.log('BREVO_API_KEY (length):', brevoApiKey?.length);
    console.log('--------------------------');

    this.brevoClient = new BrevoClient({
      apiKey: brevoApiKey || 'dummy_key_to_prevent_crash'
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
      await this.brevoClient.transactionalEmails.sendTransacEmail({
        subject: 'Welcome! Verify your email',
        textContent: `Your OTP for email verification is: ${otp}. It expires in 10 minutes.`,
        sender: { name: "Anajak Tour", email: "sethaonthemix@gmail.com" },
        to: [{ email }]
      });
      console.log('Verification email sent successfully');
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
      await this.brevoClient.transactionalEmails.sendTransacEmail({
        subject: 'Verify your email',
        textContent: `Your new OTP for email verification is: ${otp}. It expires in 10 minutes.`,
        sender: { name: "Anajak Tour", email: "sethaonthemix@gmail.com" },
        to: [{ email }]
      });
      console.log('Verification email resent successfully');
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
        await this.brevoClient.transactionalEmails.sendTransacEmail({
          subject: 'Password Reset OTP',
          textContent: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
          sender: { name: "Anajak Tour", email: "sethaonthemix@gmail.com" },
          to: [{ email }]
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