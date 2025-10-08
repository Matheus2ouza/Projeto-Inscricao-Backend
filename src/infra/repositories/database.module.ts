import { Module } from '@nestjs/common';
import { UserPrismaRepositoryProvider } from './prisma/user/model/user.prisma.repository.provider';
import { EventPrismaRepositoryProvider } from './prisma/event/event.prisma.repository.provider';
import { RegionPrismaRepositoryProvider } from './prisma/region/region.prisma.repository.provider';
import { PrismaService } from './prisma/prisma.service';
import { TypeInscriptionPrismaRepositoryProvider } from './prisma/type-inscription/type-inscription.prisma.repository.provider';

@Module({
  providers: [
    PrismaService,
    UserPrismaRepositoryProvider,
    EventPrismaRepositoryProvider,
    RegionPrismaRepositoryProvider,
    TypeInscriptionPrismaRepositoryProvider,
  ],
  exports: [
    PrismaService,
    UserPrismaRepositoryProvider,
    EventPrismaRepositoryProvider,
    RegionPrismaRepositoryProvider,
    TypeInscriptionPrismaRepositoryProvider,
  ],
})
export class DataBaseModule {}
