import { Module } from '@nestjs/common';
import { UserPrismaRepositoryProvider } from './prisma/user/model/user.prisma.repository.provider';

@Module({
  providers: [UserPrismaRepositoryProvider],
  exports: [UserPrismaRepositoryProvider],
})
export class DataBaseModule {}
