import { Module } from "@nestjs/common";
import { LocalityPrismaRepositoryProvider } from "./prisma/locality/model/locality.prisma.repository.provider";

@Module({
  providers: [LocalityPrismaRepositoryProvider],
  exports: [LocalityPrismaRepositoryProvider],
})
export class DataBaseModule {}
