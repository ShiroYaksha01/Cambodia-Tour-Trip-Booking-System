import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotInPast', async: false })
export class IsNotInPastConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return true;

    const inputDate = new Date(value);
    if (isNaN(inputDate.getTime())) return false;

    // Get current time in Cambodia (UTC+7)
    const now = new Date();
    // In many environments, new Date() is UTC. 
    // We compare UTC timestamps directly as they represent the same moment globally.
    // However, if the input is just a date (YYYY-MM-DD), we should allow today's date in Cambodia.
    
    // If the value is a full ISO string with time
    if (value.includes('T')) {
      // Allow a 1-minute buffer for network latency
      return inputDate.getTime() >= now.getTime() - 60000;
    }

    // If it's just a date (YYYY-MM-DD)
    const cambodiaToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Phnom_Penh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);

    return value >= cambodiaToday;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} cannot be in the past (Cambodia Timezone)`;
  }
}

export function IsNotInPast(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotInPastConstraint,
    });
  };
}
