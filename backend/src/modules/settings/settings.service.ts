import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  private readonly defaultSettings = {
    platformName: 'Tour Booking System',
    supportEmail: 'admin@tourbooking.local',
    supportPhone: '+855 12 345 678',
    maintenanceMode: 'false',
    commissionRate: '15.0',
    currency: 'USD',
    autoPayouts: 'true',
    requireVerification: 'true',
    sessionTimeout: '120',
  };

  async onModuleInit() {
    // Seed default settings if they don't exist
    for (const [key, value] of Object.entries(this.defaultSettings)) {
      const existing = await this.settingRepository.findOne({ where: { key } });
      if (!existing) {
        await this.settingRepository.save({ key, value: String(value) });
      }
    }
  }

  async getAllSettings() {
    const settings = await this.settingRepository.find();
    const result: Record<string, any> = {};
    for (const setting of settings) {
      let parsedValue: any = setting.value;
      if (parsedValue === 'true') parsedValue = true;
      else if (parsedValue === 'false') parsedValue = false;
      else if (!isNaN(Number(parsedValue))) parsedValue = Number(parsedValue);
      
      // Preserve string type for phone, email, name, currency
      if (['platformName', 'supportEmail', 'supportPhone', 'currency'].includes(setting.key)) {
        parsedValue = setting.value;
      }
      
      result[setting.key] = parsedValue;
    }
    return result;
  }

  async updateSettings(updates: Record<string, any>) {
    const promises = Object.entries(updates).map(async ([key, value]) => {
      let stringValue = String(value);
      const existing = await this.settingRepository.findOne({ where: { key } });
      if (existing) {
        existing.value = stringValue;
        return this.settingRepository.save(existing);
      } else {
        return this.settingRepository.save({ key, value: stringValue });
      }
    });
    
    await Promise.all(promises);
    return this.getAllSettings();
  }
}
