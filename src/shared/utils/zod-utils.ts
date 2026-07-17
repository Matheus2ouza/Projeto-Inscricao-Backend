import { ZodError } from 'zod';

export class ZodUtils {
  public static formatZodError(error: ZodError): string {
    return error.issues.map((issue) => issue.message).join('; \n');
  }

  public static formatZodErrorForLog(error: ZodError, input: unknown): string {
    return error.issues
      .map((issue) => {
        const field = issue.path.join('.');
        const value = issue.path.reduce<any>((acc, key) => acc?.[key], input);

        return `${issue.message}. Campo: '${field}'. Valor recebido: ${JSON.stringify(value)}`;
      })
      .join('; \n');
  }
}
