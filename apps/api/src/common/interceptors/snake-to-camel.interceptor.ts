import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor que transforma todos los keys de snake_case a camelCase en respuestas JSON
 * Esto asegura consistencia entre el backend (snake_case) y el frontend (camelCase)
 */
@Injectable()
export class SnakeToCamelInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Solo transformar si es un objeto JSON
        if (data && typeof data === 'object') {
          return this.transformSnakeToCamel(data);
        }
        return data;
      })
    );
  }

  /**
   * Convierte recursivamente todos los keys de snake_case a camelCase
   */
  private transformSnakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformSnakeToCamel(item));
    }

    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    const transformed: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = this.snakeToCamel(key);
        const value = obj[key];

        // Recursivamente transformar valores anidados
        if (value && typeof value === 'object') {
          transformed[camelKey] = this.transformSnakeToCamel(value);
        } else {
          transformed[camelKey] = value;
        }
      }
    }

    return transformed;
  }

  /**
   * Convierte string de snake_case a camelCase
   * Ejemplo: "user_id" -> "userId", "is_professional_active" -> "isProfessionalActive"
   */
  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }
}
