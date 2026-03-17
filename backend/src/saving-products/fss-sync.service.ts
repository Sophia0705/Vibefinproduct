import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { SavingProduct } from './entities/saving-product.entity';
import { SavingProductOption } from './entities/saving-product-option.entity';

type FssEndpoint = 'depositProductsSearch' | 'savingProductsSearch';

type FssResultWrapper<T> = {
  result: {
    prdt_div?: string;
    total_count: number;
    max_page_no: number;
    now_page_no: number;
    err_cd: string;
    err_msg: string;
    baseList?: T[];
    optionList?: unknown[];
  };
};

type FssBaseItem = {
  dcls_month?: string;
  fin_co_no?: string;
  kor_co_nm?: string;
  fin_prdt_cd?: string;
  fin_prdt_nm?: string;
  join_way?: string;
  mtrt_int?: string;
  spcl_cnd?: string;
  join_deny?: string;
  join_member?: string;
  etc_note?: string;
  max_limit?: string;
  dcls_strt_day?: string;
  dcls_end_day?: string;
  fin_co_subm_day?: string;
};

type FssOptionItem = {
  fin_prdt_cd?: string;
  intr_rate_type?: string;
  intr_rate_type_nm?: string;
  rsrv_type?: string;
  rsrv_type_nm?: string;
  save_trm?: string;
  intr_rate?: string;
  intr_rate2?: string;
};

function toNullableDateString(yyyymmdd?: string): string | null {
  if (!yyyymmdd) return null;
  const s = yyyymmdd.trim();
  if (s.length !== 8) return null;
  const yyyy = s.slice(0, 4);
  const mm = s.slice(4, 6);
  const dd = s.slice(6, 8);
  return `${yyyy}-${mm}-${dd}`;
}

function toNullableNumberString(input?: string): string | null {
  if (input === undefined || input === null) return null;
  const s = String(input).trim();
  if (!s) return null;
  return s;
}

@Injectable()
export class FssSyncService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @InjectRepository(SavingProduct)
    private readonly productRepo: Repository<SavingProduct>,
    @InjectRepository(SavingProductOption)
    private readonly optionRepo: Repository<SavingProductOption>,
  ) {}

  private get baseUrl() {
    const raw = this.config.get<string>(
      'FSS_API_BASE_URL',
      'http://finlife.fss.or.kr/finlifeapi',
    );
    return raw.replace(/\/+$/, '');
  }

  private get apiKey() {
    return this.config.get<string>('FSS_API_KEY');
  }

  private async fetchPage(
    endpoint: FssEndpoint,
    params: { topFinGrpNo: string; pageNo: number; pageSize: number },
  ): Promise<{ baseList: FssBaseItem[]; optionList: FssOptionItem[]; maxPage: number }> {
    const auth = this.apiKey;
    if (!auth) {
      throw new Error('Missing FSS_API_KEY in backend environment variables.');
    }

    const url = `${this.baseUrl}/${endpoint}.json`;
    const { data } = await firstValueFrom(
      this.http.get<FssResultWrapper<FssBaseItem>>(url, {
        params: {
          auth,
          topFinGrpNo: params.topFinGrpNo,
          pageNo: params.pageNo,
          numOfRows: params.pageSize,
        },
        timeout: 30_000,
      }),
    );

    const result = data?.result;
    if (!result) throw new Error('Unexpected FSS response: missing result.');
    if (result.err_cd !== '000') {
      throw new Error(`FSS error ${result.err_cd}: ${result.err_msg}`);
    }

    const baseList = (result.baseList ?? []) as FssBaseItem[];
    const optionList = (result.optionList ?? []) as FssOptionItem[];
    return { baseList, optionList, maxPage: result.max_page_no ?? 1 };
  }

  private mapBaseToEntity(base: FssBaseItem, productType: 'DEPOSIT' | 'SAVING'): SavingProduct {
    const joinDeny =
      base.join_deny && base.join_deny.trim() !== '' ? Number(base.join_deny) : null;

    const p = this.productRepo.create({
      finCoNo: base.fin_co_no ?? '',
      korCoNm: base.kor_co_nm ?? '',
      finPrdtCd: base.fin_prdt_cd ?? '',
      finPrdtNm: base.fin_prdt_nm ?? '',
      productType,
      joinWay: base.join_way ?? null,
      mtrtInt: base.mtrt_int ?? null,
      spclCnd: base.spcl_cnd ?? null,
      joinDeny: Number.isFinite(joinDeny as number) ? joinDeny : null,
      joinMember: base.join_member ?? null,
      etcNote: base.etc_note ?? null,
      maxLimit: toNullableNumberString(base.max_limit),
      dclsMonth: base.dcls_month ?? null,
      dclsStrtDay: toNullableDateString(base.dcls_strt_day),
      dclsEndDay: toNullableDateString(base.dcls_end_day),
      finCoSubmDay: base.fin_co_subm_day ?? null,
    });
    return p;
  }

  private mapOptionToEntity(
    opt: FssOptionItem,
    productId: string,
  ): SavingProductOption | null {
    const saveTrm = opt.save_trm ? Number(opt.save_trm) : NaN;
    if (!Number.isFinite(saveTrm)) return null;

    return this.optionRepo.create({
      productId,
      intrRateType: opt.intr_rate_type ?? '',
      intrRateTypeNm: opt.intr_rate_type_nm ?? null,
      rsrvType: opt.rsrv_type ?? '',
      rsrvTypeNm: opt.rsrv_type_nm ?? null,
      saveTrm,
      intrRate: toNullableNumberString(opt.intr_rate),
      intrRate2: toNullableNumberString(opt.intr_rate2),
    });
  }

  private async upsertProductsAndOptions(args: {
    productType: 'DEPOSIT' | 'SAVING';
    baseList: FssBaseItem[];
    optionList: FssOptionItem[];
  }) {
    const baseEntities = args.baseList
      .filter((b) => b.fin_co_no && b.fin_prdt_cd)
      .map((b) => this.mapBaseToEntity(b, args.productType));

    if (baseEntities.length === 0) {
      return { productsUpserted: 0, optionsUpserted: 0 };
    }

    await this.productRepo.upsert(baseEntities, ['finCoNo', 'finPrdtCd']);

    const codes = Array.from(
      new Set(baseEntities.map((b) => b.finPrdtCd).filter((v) => !!v)),
    );

    const persistedProducts = await this.productRepo
      .createQueryBuilder('p')
      .select(['p.id', 'p.finCoNo', 'p.finPrdtCd'])
      .where('p.finPrdtCd IN (:...codes)', { codes })
      .andWhere('p.finCoNo IN (:...coNos)', {
        coNos: Array.from(new Set(baseEntities.map((b) => b.finCoNo))),
      })
      .getMany();

    const byCodeAndCoNo = new Map<string, SavingProduct>();
    for (const p of persistedProducts) {
      byCodeAndCoNo.set(`${p.finCoNo}::${p.finPrdtCd}`, p);
    }

    const optionEntities: SavingProductOption[] = [];
    for (const o of args.optionList) {
      const finPrdtCd = o.fin_prdt_cd;
      if (!finPrdtCd) continue;

      // 옵션에는 fin_co_no가 없어서, 같은 코드가 여러 금융사에 있을 수 있다는 점은 현실적으로 거의 없고,
      // 그래도 안전하게 coNo 후보를 순회해 첫 매칭에 넣는다.
      const candidates = baseEntities.filter((b) => b.finPrdtCd === finPrdtCd);
      for (const c of candidates) {
        const product = byCodeAndCoNo.get(`${c.finCoNo}::${finPrdtCd}`);
        if (!product) continue;
        const ent = this.mapOptionToEntity(o, product.id);
        if (ent) optionEntities.push(ent);
      }
    }

    if (optionEntities.length > 0) {
      await this.optionRepo.upsert(optionEntities, [
        'productId',
        'intrRateType',
        'rsrvType',
        'saveTrm',
      ]);
    }

    return { productsUpserted: baseEntities.length, optionsUpserted: optionEntities.length };
  }

  async syncAll(args?: { topFinGrpNos?: string[]; pageSize?: number }) {
    const topFinGrpNos = args?.topFinGrpNos?.length ? args.topFinGrpNos : ['020000']; // 은행 기본
    const pageSize = args?.pageSize && args.pageSize > 0 ? args.pageSize : 100;

    const summary = {
      topFinGrpNos,
      pageSize,
      deposit: { productsUpserted: 0, optionsUpserted: 0, pages: 0 },
      saving: { productsUpserted: 0, optionsUpserted: 0, pages: 0 },
    };

    for (const topFinGrpNo of topFinGrpNos) {
      for (const job of [
        { endpoint: 'depositProductsSearch' as const, productType: 'DEPOSIT' as const },
        { endpoint: 'savingProductsSearch' as const, productType: 'SAVING' as const },
      ]) {
        let pageNo = 1;
        let maxPage = 1;
        do {
          const page = await this.fetchPage(job.endpoint, { topFinGrpNo, pageNo, pageSize });
          maxPage = page.maxPage || 1;

          const { productsUpserted, optionsUpserted } = await this.upsertProductsAndOptions({
            productType: job.productType,
            baseList: page.baseList,
            optionList: page.optionList,
          });

          if (job.productType === 'DEPOSIT') {
            summary.deposit.productsUpserted += productsUpserted;
            summary.deposit.optionsUpserted += optionsUpserted;
            summary.deposit.pages += 1;
          } else {
            summary.saving.productsUpserted += productsUpserted;
            summary.saving.optionsUpserted += optionsUpserted;
            summary.saving.pages += 1;
          }

          pageNo += 1;
        } while (pageNo <= maxPage);
      }
    }

    return summary;
  }
}

