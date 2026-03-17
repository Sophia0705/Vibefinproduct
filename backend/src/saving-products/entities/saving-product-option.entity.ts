import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SavingProduct } from './saving-product.entity';

@Entity({ name: 'saving_product_options' })
@Index(['productId', 'intrRateType', 'rsrvType', 'saveTrm'], { unique: true })
export class SavingProductOption {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint' })
  productId!: string;

  @ManyToOne(() => SavingProduct, (p) => p.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: SavingProduct;

  @Column({ type: 'varchar', length: 10, nullable: true })
  intrRateType!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  intrRateTypeNm!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  rsrvType!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rsrvTypeNm!: string | null;

  @Column({ type: 'int' })
  saveTrm!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  intrRate!: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  intrRate2!: string | null;
}

