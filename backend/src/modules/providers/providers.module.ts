import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
// import { ProviderContact } from './entities/provider-contact.entity';
import { ProviderController } from './provider.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Provider])],
  controllers: [ProviderController],
  providers: [],
  exports: [TypeOrmModule],
})
export class ProvidersModule {}
