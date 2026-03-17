import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingProduct } from './entities/saving-product.entity';
import { SavingProductOption } from './entities/saving-product-option.entity';
import { FssSyncController } from './fss-sync.controller';
import { FssSyncService } from './fss-sync.service';
import { SavingProductsController } from './saving-products.controller';
import { SavingProductsService } from './saving-products.service';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { AdminStatsController } from './admin-stats.controller';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([SavingProduct, SavingProductOption])],
  controllers: [FssSyncController, SavingProductsController, BanksController, AdminStatsController],
  providers: [FssSyncService, SavingProductsService, BanksService],
  exports: [TypeOrmModule, FssSyncService, SavingProductsService, BanksService],
})
export class SavingProductsModule {}

