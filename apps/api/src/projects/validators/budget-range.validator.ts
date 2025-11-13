import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador personalizado para asegurar que budget_min <= budget_max
 * Uso: @ValidBudgetRange() en la clase DTO
 */
@ValidatorConstraint({ name: 'validBudgetRange', async: false })
export class ValidBudgetRangeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;

    // Si no existen ambos presupuestos, es válido (opcionales)
    if (!object.budget_min || !object.budget_max) {
      return true;
    }

    // Validar que budget_min <= budget_max
    return object.budget_min <= object.budget_max;
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as any;
    return `budget_min (${object.budget_min}) must be less than or equal to budget_max (${object.budget_max})`;
  }
}

/**
 * Decorador para aplicar la validación a una clase DTO
 */
export function ValidBudgetRange(validationOptions?: ValidationOptions) {
  return function (target: any, propertyName?: string) {
    registerDecorator({
      name: 'validBudgetRange',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ValidBudgetRangeConstraint,
    });
  };
}
