import { Locality } from "../entities/locality.entity";

export abstract class LocalityGateway {
  abstract findBylocality(locality: string): Promise<Locality | null>;
  abstract findById(id: string): Promise<Locality | null>;
  abstract create(locality: Locality): Promise<void>;
  
}