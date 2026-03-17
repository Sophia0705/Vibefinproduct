import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SavingProductOption } from './saving-product-option.entity';

export type SavingProductType = 'DEPOSIT' | 'SAVING';

@Entity({ name: 'saving_products' })
@Index(['finCoNo', 'finPrdtCd'], { unique: true })
export class SavingProduct {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  finCoNo!: string;

  @Column({ type: 'varchar', length: 100 })
  korCoNm!: string;

  @Column({ type: 'varchar', length: 30 })
  finPrdtCd!: string;

  @Column({ type: 'varchar', length: 200 })
  finPrdtNm!: string;

  @Column({ type: 'enum', enum: ['DEPOSIT', 'SAVING'] })
  productType!: SavingProductType;

  @Column({ type: 'text', nullable: true })
  joinWay!: string | null;

  @Column({ type: 'text', nullable: true })
  mtrtInt!: string | null;

  @Column({ type: 'text', nullable: true })
  spclCnd!: string | null;

  @Column({ type: 'tinyint', nullable: true })
  joinDeny!: number | null;

  @Column({ type: 'text', nullable: true })
  joinMember!: string | null;

  @Column({ type: 'text', nullable: true })
  etcNote!: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  maxLimit!: string | null;

  @Column({ type: 'varchar', length: 6, nullable: true })
  dclsMonth!: string | null;

  @Column({ type: 'date', nullable: true })
  dclsStrtDay!: string | null;

  @Column({ type: 'date', nullable: true })
  dclsEndDay!: string | null;

  @Column({ type: 'varchar', length: 14, nullable: true })
  finCoSubmDay!: string | null;

  @OneToMany(() => SavingProductOption, (opt) => opt.product, {
    cascade: ['insert', 'update'],
  })
  options!: SavingProductOption[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}

