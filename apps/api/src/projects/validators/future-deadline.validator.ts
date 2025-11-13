import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador personalizado para asegurar que la fecha límite es en el futuro
 * Uso: @FutureDeadline() en la propiedad deadline
 */
@ValidatorConstraint({ name: 'futureDeadline', async: false })
export class FutureDeadlineConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    // Si no hay valor, es válido (puede ser opcional)
    if (!value) {
      return true;
    }

    const deadline = new Date(value);
    const now = new Date();

    // Deadline debe ser en el futuro (mínimo dentro de 1 hora para evitar timezone issues)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return deadline > oneHourFromNow;
  }

  defaultMessage(args: ValidationArguments) {
    const value = args.value;
    const deadlineDate = new Date(value);
    const now = new Date();

    return `deadline must be in the future. Provided: ${deadlineDate.toISOString()}, Current: ${now.toISOString()}`;
  }
}

/**
 * Decorador para aplicar la validación a una propiedad
 */
export function FutureDeadline(validationOptions?: ValidationOptions) {
  return function (target: any, propertyName: string) {
    registerDecorator({
      name: 'futureDeadline',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: FutureDeadlineConstraint,
    });
  };
}
