import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { ExclusiveInscriptionLinkType } from '../entities/exclusive-inscription-link-type.entity';

export abstract class ExclusiveInscriptionLinkTypeGateway {
  abstract create(
    exclusiveInscriptionLinkType: ExclusiveInscriptionLinkType,
  ): Promise<ExclusiveInscriptionLinkType>;

  abstract createTx(
    exclusiveInscriptionLinkType: ExclusiveInscriptionLinkType,
    tx: PrismaTransactionClient,
  ): Promise<ExclusiveInscriptionLinkType>;

  abstract findByExclusiveLinkId(
    exclusiveLinkId: string,
  ): Promise<ExclusiveInscriptionLinkType[]>;
}
