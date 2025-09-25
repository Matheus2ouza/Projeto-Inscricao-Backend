import { User } from '../entities/user.entity';

export abstract class UserGateway {
  abstract findByUser(username: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract create(username: User): Promise<void>;
}
