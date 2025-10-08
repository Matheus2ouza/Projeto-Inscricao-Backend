import { Module } from '@nestjs/common';
import { UserPrismaRepositoryProvider } from './prisma/user/model/user.prisma.repository.provider';
import { EventPrismaRepositoryProvider } from './prisma/event/event.prisma.repository.provider';
import { RegionPrismaRepositoryProvider } from './prisma/region/region.prisma.repository.provider';
import { PrismaService } from './prisma/prisma.service';
import { TypeInscriptionPrismaRepositoryProvider } from './prisma/type-inscription/type-inscription.prisma.repository.provider';
import { InscriptionPrismaRepositoryProvider } from './prisma/inscription/inscription.prisma.repository.provider';
import { ParticipantPrismaRepositoryProvider } from './prisma/participant/participant.prisma.repository.provider';

@Module({
  providers: [
    PrismaService,
    UserPrismaRepositoryProvider,
    EventPrismaRepositoryProvider,
    RegionPrismaRepositoryProvider,
    TypeInscriptionPrismaRepositoryProvider,
    InscriptionPrismaRepositoryProvider,
    ParticipantPrismaRepositoryProvider,
  ],
  exports: [
    PrismaService,
    UserPrismaRepositoryProvider,
    EventPrismaRepositoryProvider,
    RegionPrismaRepositoryProvider,
    TypeInscriptionPrismaRepositoryProvider,
    InscriptionPrismaRepositoryProvider,
    ParticipantPrismaRepositoryProvider,
  ],
})
export class DataBaseModule {}
