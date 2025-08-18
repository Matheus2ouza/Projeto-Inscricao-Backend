import { User } from "../entities/user.entity";

export interface UserGateway {
  findBylocality(locality: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
  
}