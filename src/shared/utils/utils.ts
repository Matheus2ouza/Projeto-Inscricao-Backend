import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { customAlphabet } from 'nanoid';

export class Utils {
  public static generateUUID(): string {
    return randomUUID();
  }

  public static generateConfirmationCode(): string {
    const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 12);

    const code = nanoid();

    return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`;
  }

  public static encryptPassword(password: string): string {
    const salt = this.generateSalt();
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
  }

  public static comparePassword(
    password: string,
    hashedPassword: string,
  ): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  private static generateSalt(): string {
    const saltRounds = 12;
    const salt = bcrypt.genSaltSync(saltRounds);
    return salt;
  }
}
