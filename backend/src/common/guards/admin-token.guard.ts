import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request & { headers?: any }>();
    const expected = this.config.get<string>('ADMIN_API_TOKEN');
    if (!expected) return true; // dev: if not configured, don't block

    const got = (req.headers?.['x-admin-token'] ?? req.headers?.['X-Admin-Token']) as
      | string
      | undefined;
    if (got && got === expected) return true;
    throw new UnauthorizedException('Missing or invalid admin token.');
  }
}

