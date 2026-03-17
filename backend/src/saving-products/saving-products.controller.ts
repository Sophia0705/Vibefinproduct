import { Controller, Get, Query } from '@nestjs/common';
import { SavingProductsService } from './saving-products.service';

@Controller('saving-products')
export class SavingProductsController {
  constructor(private readonly savingProductsService: SavingProductsService) {}

  @Get()
  async list(
    @Query('type') type?: 'DEPOSIT' | 'SAVING',
    @Query('q') q?: string,
    @Query('finCoNo') finCoNo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.savingProductsService.list({
      type,
      q,
      finCoNo,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }
}

