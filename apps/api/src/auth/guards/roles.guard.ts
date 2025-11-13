import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Mapea roles requeridos a roles válidos considerando 'dual' y 'admin'
   * - Si requiere 'professional', acepta users con 'professional', 'dual' (si está activo)
   * - Si requiere 'client', acepta users con 'client' y 'dual'
   * - Si requiere 'admin', acepta solo users con 'admin'
   * - 'admin' siempre tiene acceso a endpoints de otros roles
   */
  private mapValidRoles(requiredRole: string, user: any): boolean {
    const userType = user?.user_type;

    // Admin siempre tiene acceso a todo
    if (userType === 'admin') {
      return true;
    }

    // Exacta match
    if (userType === requiredRole) {
      return true;
    }

    // Usuarios 'dual' pueden actuar como 'professional' si subscription está activa
    if (requiredRole === 'professional' && userType === 'dual') {
      return user?.is_professional_active === true && user?.subscription_status === 'active';
    }

    // Usuarios 'dual' pueden actuar como 'client'
    if (requiredRole === 'client' && userType === 'dual') {
      return true;
    }

    return false;
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Check if user has any of the required roles
    return requiredRoles.some((role) => this.mapValidRoles(role, user));
  }
}