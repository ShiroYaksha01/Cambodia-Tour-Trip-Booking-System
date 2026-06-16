import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as ws from 'ws';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        realtime: {
          transport: ws as any,
        },
      });
    } else {
      console.warn('Supabase credentials missing! SupabaseService will not be functional.');
    }
  }

  async uploadImage(file: any, bucket: string = 'uploads'): Promise<string> {
    if (!this.supabase) {
      throw new InternalServerErrorException('Supabase client not initialized. Check your environment variables.');
    }
    const filename = `${Date.now()}-${file.originalname}`;
    
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Upload Error:', error);
      throw new InternalServerErrorException(`Failed to upload image: ${error.message}`);
    }

    // Return the public URL
    const { data: publicData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  }
}
