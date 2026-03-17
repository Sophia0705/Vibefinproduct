import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminTokenGuard } from '../common/guards/admin-token.guard';
import { SavingProduct } from './entities/saving-product.entity';
import { SavingProductOption } from './entities/saving-product-option.entity';

@Controller('admin/stats')
@UseGuards(AdminTokenGuard)
export class AdminStatsController {
  constructor(
    @InjectRepository(SavingProduct)
    private readonly productRepo: Repository<SavingProduct>,
    @InjectRepository(SavingProductOption)
    private readonly optionRepo: Repository<SavingProductOption>,
  ) {}

  @Get('duplicates')
  async duplicates() {
    const productTotal = await this.productRepo.count();
    const optionTotal = await this.optionRepo.count();

    const productDupGroups = await this.productRepo
      .createQueryBuilder('p')
      .select('p.finCoNo', 'finCoNo')
      .addSelect('p.finPrdtCd', 'finPrdtCd')
      .addSelect('COUNT(*)', 'cnt')
      .groupBy('p.finCoNo')
      .addGroupBy('p.finPrdtCd')
      .having('COUNT(*) > 1')
      .getRawMany<{ finCoNo: string; finPrdtCd: string; cnt: string }>();

    const optionDupGroups = await this.optionRepo
      .createQueryBuilder('o')
      .select('o.productId', 'productId')
      .addSelect("COALESCE(o.intrRateType, '')", 'intrRateType')
      .addSelect("COALESCE(o.rsrvType, '')", 'rsrvType')
      .addSelect('o.saveTrm', 'saveTrm')
      .addSelect('COUNT(*)', 'cnt')
      .groupBy('o.productId')
      .addGroupBy("COALESCE(o.intrRateType, '')")
      .addGroupBy("COALESCE(o.rsrvType, '')")
      .addGroupBy('o.saveTrm')
      .having('COUNT(*) > 1')
      .getRawMany<{
        productId: string;
        intrRateType: string | null;
        rsrvType: string | null;
        saveTrm: number;
        cnt: string;
      }>();

    return {
      productTotal,
      optionTotal,
      productDuplicateGroups: productDupGroups.length,
      optionDuplicateGroups: optionDupGroups.length,
      productDupGroups: productDupGroups.slice(0, 50),
      optionDupGroups: optionDupGroups.slice(0, 50),
    };
  }

  @Get('deduplicate-options')
  async deduplicateOptions() {
    // Keep the smallest id per (productId, intrRateType, rsrvType, saveTrm), delete the rest.
    const deleteResult = await this.optionRepo.query(`
      DELETE o
      FROM saving_product_options o
      JOIN (
        SELECT
          MIN(id) AS keepId,
          productId,
          COALESCE(intrRateType, '') AS intrRateTypeKey,
          COALESCE(rsrvType, '') AS rsrvTypeKey,
          saveTrm
        FROM saving_product_options
        GROUP BY productId, intrRateTypeKey, rsrvTypeKey, saveTrm
        HAVING COUNT(*) > 1
      ) d
        ON o.productId = d.productId
       AND COALESCE(o.intrRateType, '') = d.intrRateTypeKey
       AND COALESCE(o.rsrvType, '') = d.rsrvTypeKey
       AND o.saveTrm = d.saveTrm
       AND o.id <> d.keepId
    `);

    const normalizeResult = await this.optionRepo.query(`
      UPDATE saving_product_options
      SET intrRateType = COALESCE(intrRateType, ''),
          rsrvType = COALESCE(rsrvType, '')
      WHERE intrRateType IS NULL OR rsrvType IS NULL
    `);

    return { ok: true, deleteResult, normalizeResult };
  }
}

