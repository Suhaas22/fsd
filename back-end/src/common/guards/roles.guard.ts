import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const roleHeader = request.headers['x-role'] || request.headers['role'];
    const authHeader = request.headers['authorization'];

    // If no role header provided, allow standard access or fallback to active role
    if (!roleHeader && !authHeader) {
      return true;
    }

    const userRole = (roleHeader || '').toLowerCase();
    return requiredRoles.some((role) => role.toLowerCase() === userRole || role === '*' || userRole === 'admin' || userRole === 'superadmin');
  }
}
