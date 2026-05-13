import { Injectable } from '@nestjs/common';
import { ExclusiveInscriptionLinkGateway } from 'src/domain/repositories/exclusive-inscription-link.gateway';
import { Usecase } from 'src/usecases/usecase';
import { ExclusiveInscriptionLinkInactiveOrExpiredException } from '../../exceptions/exclusive-inscription-link/exclusive-inscription-link-inactive-or-expired.usecase.exception';
import { ExclusiveInscriptionLinkNotFoundException } from '../../exceptions/exclusive-inscription-link/exclusive-inscription-link-not-found.usecase.exception';

export type ValidateExclusiveInscriptionLinkInput = {
  token: string;
};

@Injectable()
export class ValidateExclusiveInscriptionLinkUsecase
  implements Usecase<ValidateExclusiveInscriptionLinkInput, void>
{
  constructor(
    private readonly exclusiveInscriptionLinkGateway: ExclusiveInscriptionLinkGateway,
  ) {}

  async execute(input: ValidateExclusiveInscriptionLinkInput): Promise<void> {
    const exclusiveLink =
      await this.exclusiveInscriptionLinkGateway.findByToken(input.token);

    if (!exclusiveLink) {
      throw new ExclusiveInscriptionLinkNotFoundException(
        `Exclusive inscription link not found by token: ${input.token}`,
        'Link de inscrição não encontrado ou inválido.',
        ValidateExclusiveInscriptionLinkUsecase.name,
      );
    }

    if (!exclusiveLink.getActive()) {
      throw new ExclusiveInscriptionLinkInactiveOrExpiredException(
        'Exclusive inscription link is inactive',
        'Este link de inscrição está inativo.',
        ValidateExclusiveInscriptionLinkUsecase.name,
      );
    }

    const nowDate = new Date();

    if (exclusiveLink.getExpiresAt() < nowDate) {
      throw new ExclusiveInscriptionLinkInactiveOrExpiredException(
        'Exclusive inscription link has expired',
        'Este link de inscrição expirou.',
        ValidateExclusiveInscriptionLinkUsecase.name,
      );
    }
  }
}
