import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { ProviderController } from './provider.controller';
import { ProvidersService } from './providers.service';
import { UsersModule } from '../users/users.module';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, Service]), UsersModule],
  controllers: [ProviderController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}


