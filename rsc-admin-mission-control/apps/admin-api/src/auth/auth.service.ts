import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface AdminUserPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface UserPayload {
  id: string;
  email: string;
  wallet_address?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  // Admin authentication
  async validateAdminUser(email: string, password: string): Promise<any> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      await this.auditService.logAction({
        adminUserId: admin.id,
        actionType: 'LOGIN',
        resourceType: 'admin_user',
        resourceId: admin.id,
        actionDetails: { success: false, reason: 'invalid_password' },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash, ...result } = admin;

    await this.auditService.logAction({
      adminUserId: admin.id,
      actionType: 'LOGIN',
      resourceType: 'admin_user',
      resourceId: admin.id,
      actionDetails: { success: true },
    });

    // Update last login
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    return result;
  }

  async loginAdmin(admin: any) {
    const payload: AdminUserPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || [],
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ADMIN_JWT_SECRET'),
      expiresIn: this.configService.get<string>('ADMIN_JWT_EXPIRES', '8h'),
    });

    return {
      access_token: token,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    };
  }

  // User authentication (for future use)
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    // For demo purposes, we'll use a simple password check
    // In production, you'd hash passwords properly
    const isPasswordValid = password === 'demo123'; // TODO: Implement proper password hashing

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async loginUser(user: any) {
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      wallet_address: user.walletAddress,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
      },
    };
  }

  // Utility methods
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async createAdminUser(email: string, password: string, role: string = 'ANALYST') {
    const existingAdmin = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new BadRequestException('Admin user already exists');
    }

    const passwordHash = await this.hashPassword(password);

    const admin = await this.prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        role: role as any,
        permissions: this.getDefaultPermissions(role),
      },
    });

    await this.auditService.logAction({
      adminUserId: admin.id,
      actionType: 'CREATE',
      resourceType: 'admin_user',
      resourceId: admin.id,
      actionDetails: { email, role },
    });

    return admin;
  }

  private getDefaultPermissions(role: string): string[] {
    const permissionMap = {
      SUPER_ADMIN: ['*'],
      OPS_LEAD: ['users:read', 'users:write', 'follow_bonus:*', 'events:*', 'audit:read'],
      ANALYST: ['users:read', 'follow_bonus:read', 'follow_bonus:write', 'events:read', 'audit:read'],
      VIEWER: ['users:read', 'follow_bonus:read', 'events:read', 'audit:read'],
      AUDITOR: ['audit:read'],
    };

    return permissionMap[role] || [];
  }

  // Permission checking
  hasPermission(admin: AdminUserPayload, requiredPermission: string): boolean {
    if (admin.permissions.includes('*')) {
      return true;
    }

    return admin.permissions.includes(requiredPermission);
  }

  hasAnyPermission(admin: AdminUserPayload, requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => this.hasPermission(admin, permission));
  }

  isSuperAdmin(admin: AdminUserPayload): boolean {
    return admin.role === 'SUPER_ADMIN';
  }
}
