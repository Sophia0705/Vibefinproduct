import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingProduct } from './entities/saving-product.entity';
import { SavingProductOption } from './entities/saving-product-option.entity';

@Injectable()
export class SavingProductsService {
  constructor(
    @InjectRepository(SavingProduct)
    private readonly productRepo: Repository<SavingProduct>,
    @InjectRepository(SavingProductOption)
    private readonly optionRepo: Repository<SavingProductOption>,
  ) {}

  async list(args: {
    type?: 'DEPOSIT' | 'SAVING';
    q?: string;
    finCoNo?: string;
    page: number;
    limit: number;
  }) {
    const page = Number.isFinite(args.page) && args.page > 0 ? args.page : 1;
    const limit =
      Number.isFinite(args.limit) && args.limit > 0 ? Math.min(args.limit, 100) : 20;

    // IMPORTANT:
    // We paginate products, but also return options (1:N). If we join options in the paging query,
    // MySQL row multiplication breaks both total count and page slicing.
    // So we do it in two steps:
    // 1) page over DISTINCT product ids with filters
    // 2) fetch those products with options
    const idsQb = this.productRepo.createQueryBuilder('p');

    if (args.type) {
      idsQb.andWhere('p.productType = :type', { type: args.type });
    }
    if (args.finCoNo && args.finCoNo.trim()) {
      idsQb.andWhere('p.finCoNo = :finCoNo', { finCoNo: args.finCoNo.trim() });
    }
    if (args.q && args.q.trim()) {
      idsQb.andWhere('(p.finPrdtNm LIKE :q OR p.korCoNm LIKE :q)', {
        q: `%${args.q.trim()}%`,
      });
    }

    const total = await idsQb.clone().getCount();

    const idRows = await idsQb
      .clone()
      .select('p.id', 'id')
      .orderBy('p.korCoNm', 'ASC')
      .addOrderBy('p.finPrdtNm', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{ id: string }>();

    const ids = idRows.map((r) => r.id).filter(Boolean);
    if (ids.length === 0) {
      return { page, limit, total, items: [] as SavingProduct[] };
    }

    const items = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.options', 'o')
      .where('p.id IN (:...ids)', { ids })
      .orderBy('p.korCoNm', 'ASC')
      .addOrderBy('p.finPrdtNm', 'ASC')
      .addOrderBy('o.saveTrm', 'ASC')
      .getMany();

    return {
      page,
      limit,
      total,
      items,
    };
  }
}

