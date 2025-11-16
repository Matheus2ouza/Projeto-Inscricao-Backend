import { User } from '../entities/user.entity';

export abstract class UserGateway {
  abstract findByUser(username: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findRegionById(id: string): Promise<any | null>;
  abstract findAll(roles?: string[]): Promise<User[]>;
  abstract create(username: User): Promise<void>;
  abstract findManyPaginated(page: number, pageSize: number): Promise<User[]>;
  abstract countAll(): Promise<number>;
  // Buscar múltiplos usuários por IDs
  abstract findByIds(ids: string[]): Promise<User[]>;
}
