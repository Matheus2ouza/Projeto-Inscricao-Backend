import { ZodError } from 'zod';

export class ZodUtils {
  public static FormatZodError(error: ZodError): string {
    const message = error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    return message;
  }
}
