 

import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PasswordReset } from './entities/password-reset.entity';
import { Provider } from '../providers/entities/provider.entity';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private async sendEmail(to: string, subject: string, text: string) {
    try {
      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM', '"Anajak Tour" <sethaonthemix@gmail.com>'),
        to,
        subject,
        html: text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully via SMTP');
    } catch (error) {
      console.error('Failed to send email via SMTP:', error);
      // Don't throw error to prevent breaking registration/forgot-password flow 
      // if email service is down in dev/test, but in prod you might want to.
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
    const userToCreate = {
      username,
      email,
      passwordHash: hash,
      phoneNumber,
      profilePicture,
      role: (role ?? 'customer') as any,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    };

    const user = await this.usersService.create(userToCreate);

    // If role is provider, create the provider profile record
    if (role === 'provider') {
      console.log(`Creating provider profile for user: ${user.id}`);
      const provider = this.providerRepository.create({
        userId: user.id,
        companyName: username, // Use username as initial company name
      });
      await this.providerRepository.save(provider);
    }

    try {
      console.log(`Attempting to send welcome email to: ${email}`);
      await this.sendEmail(
        email, 
        'Welcome to Anajak Tour!', 
        `Your account has been created successfully. You can now log in.`
      );
    } catch (emailError) {
      console.error('Welcome email sending failed:', emailError);
    }

    return { success: true, message: 'Registration successful' };
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