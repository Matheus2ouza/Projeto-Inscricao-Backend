import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { ExclusiveInscriptionLink } from '../entities/exclusive-inscription-link.entity';

export abstract class ExclusiveInscriptionLinkGateway {
  abstract create(
    exclusiveInscriptionLink: ExclusiveInscriptionLink,
  ): Promise<ExclusiveInscriptionLink>;

  abstract createTx(
    exclusiveInscriptionLink: ExclusiveInscriptionLink,
    tx: PrismaTransactionClient,
  ): Promise<ExclusiveInscriptionLink>;

  abstract findById(id: string): Promise<ExclusiveInscriptionLink | null>;
  abstract findByToken(token: string): Promise<ExclusiveInscriptionLink | null>;

  abstract findPaginated(
    filters: { eventId: string },
    page: number,
    pageSize: number,
  ): Promise<ExclusiveInscriptionLink[]>;

  abstract countAll(filters: { eventId: string }): Promise<number>;
}
