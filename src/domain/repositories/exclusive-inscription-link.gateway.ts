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
}
