import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { ProviderController } from './provider.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, ProviderContact])],
  controllers: [ProviderController],
  providers: [],
  exports: [TypeOrmModule],
})
export class ProvidersModule {}
