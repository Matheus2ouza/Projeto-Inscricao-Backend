import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { Usecase } from 'src/usecases/usecase';

export type ReceiveSyncInscriptionInput = {
  record: Record<string, unknown>;
};

export type ReceiveSyncInscriptionOutput = {
  id: string;
  operation: 'upserted';
};

@Injectable()
export class ReceiveSyncInscriptionUsecase
  implements
    Usecase<ReceiveSyncInscriptionInput, ReceiveSyncInscriptionOutput>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    input: ReceiveSyncInscriptionInput,
  ): Promise<ReceiveSyncInscriptionOutput> {
    const id = input.record.id;

    if (typeof id !== 'string' || id.length === 0) {
      throw new Error('Invalid sync payload: record.id is required');
    }

    await this.prisma.inscription.upsert({
      where: { id },
      create: input.record as any,
      update: input.record as any,
    });

    return {
      id,
      operation: 'upserted',
    };
  }
}

