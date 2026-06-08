import { Controller, Get, Param } from '@nestjs/common';
import { ProvidersService } from './providers.service';

@Controller('providers')
export class PublicProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get(':id')
  async getProviderDetail(@Param('id') id: string) {
    const data = await this.providersService.getPublicProviderById(id);
    return { success: true, data };
  }
}
