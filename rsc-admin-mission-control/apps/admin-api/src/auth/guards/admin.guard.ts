import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService, AdminUserPayload } from '../auth.service';

export interface AdminRequest extends Request {
  admin: AdminUserPayload;
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const admin = request.admin;

    if (!admin) {
      throw new ForbiddenException('Admin authentication required');
    }

    // Check permissions if specified
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = this.authService.hasAnyPermission(admin, requiredPermissions);
      if (!hasPermission) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }
}
