import { LocalityGateway } from "src/domain/repositories/locality.geteway";
import { prismaClient } from "../client.prisma"
import { LocalityPrismaModalToLocalityEntityMapper } from "./model/mappers/locality-prisma-model-to-locality-entity.mapper";
import { Locality } from "src/domain/entities/locality.entity";
import { LocalityEntityToLocalityPrismaModalMapper } from "./model/mappers/locality-entity-to-locality-prisma-model.mapper";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalityPrismaRepository extends LocalityGateway {
  public constructor() {
    super()
  }

  public async findBylocality(locality: string): Promise<Locality | null> {
    const aModel = await prismaClient.locality.findUnique({
      where: { locality }
    })

    if (!aModel) return null;


    const anLocality = LocalityPrismaModalToLocalityEntityMapper.map(aModel);

    return anLocality;
  }

  public async findById(id: string): Promise<Locality | null> {
    const aModel = await prismaClient.locality.findUnique({
      where: {
        id
      }
    })

    if (!aModel) return null

    const anLocality = LocalityPrismaModalToLocalityEntityMapper.map(aModel);

    return anLocality
  }
  public async create(locality: Locality): Promise<void> {
    const aModel = LocalityEntityToLocalityPrismaModalMapper.map(locality);
    await prismaClient.locality.create({
      data: aModel
    })
  }
}