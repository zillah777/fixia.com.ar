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
          const transformed = this.transformSnakeToCamel(data);

          // DEBUG: Log transformation for /projects endpoint
          const request = context.switchToHttp().getRequest();
          if (request.url === '/projects') {
            console.log('🔄 SnakeToCamelInterceptor transformation:', {
              beforeTransform: Array.isArray(data) ? {
                isArray: true,
                length: data.length,
                firstProject: data[0] ? {
                  id: data[0].id,
                  hasProposals: 'proposals' in data[0],
                  proposalsValue: data[0].proposals,
                } : null,
              } : 'not array',
              afterTransform: Array.isArray(transformed) ? {
                isArray: true,
                length: transformed.length,
                firstProject: transformed[0] ? {
                  id: transformed[0].id,
                  hasProposals: 'proposals' in transformed[0],
                  proposalsValue: transformed[0].proposals,
                } : null,
              } : 'not array',
            });
          }

          return transformed;
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
   * IMPORTANTE: Preserva underscore inicial para campos especiales de Prisma como "_count"
   */
  private snakeToCamel(str: string): string {
    // Si empieza con underscore, preservarlo y solo transformar el resto
    if (str.startsWith('_')) {
      const rest = str.slice(1); // Quitar el underscore inicial
      return '_' + rest.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    }
    // Transformación normal para campos sin underscore inicial
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }
}
