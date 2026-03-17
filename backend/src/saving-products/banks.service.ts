import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingProduct } from './entities/saving-product.entity';

@Injectable()
export class BanksService {
  constructor(
    @InjectRepository(SavingProduct)
    private readonly productRepo: Repository<SavingProduct>,
  ) {}

  async list() {
    const rows = await this.productRepo
      .createQueryBuilder('p')
      .select('p.finCoNo', 'finCoNo')
      .addSelect('p.korCoNm', 'korCoNm')
      .groupBy('p.finCoNo')
      .addGroupBy('p.korCoNm')
      .orderBy('p.korCoNm', 'ASC')
      .getRawMany<{ finCoNo: string; korCoNm: string }>();

    return { items: rows };
  }
}

