import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FssSyncService } from './fss-sync.service';
import { AdminTokenGuard } from '../common/guards/admin-token.guard';

@Controller('admin/fss')
export class FssSyncController {
  constructor(private readonly fssSyncService: FssSyncService) {}

  @Post('sync')
  @UseGuards(AdminTokenGuard)
  async sync(
    @Body()
    body: {
      topFinGrpNos?: string[];
      pageSize?: number;
    },
  ) {
    const result = await this.fssSyncService.syncAll({
      topFinGrpNos: body?.topFinGrpNos,
      pageSize: body?.pageSize,
    });
    return result;
  }
}

