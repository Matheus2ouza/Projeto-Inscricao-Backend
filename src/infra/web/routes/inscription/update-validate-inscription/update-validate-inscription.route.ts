import { Controller, Param, Patch, Query } from '@nestjs/common';
import {
  UpdateValidateInscriptionInput,
  UpdateValidateInscriptionUsecase,
} from 'src/usecases/web/inscription/update-validate-inscription/update-validate-inscription.usecase';
import type {
  UpdateValidateInscriptionRequest,
  UpdateValidateInscriptionResponse,
} from './update-validate-inscription.dto';
import { UpdateValidateInscriptionPresenter } from './update-validate-inscription.presenter';

@Controller('inscriptions')
export class UpdateValidateInscriptionRoute {
  public constructor(
    private readonly updateValidateInscriptionUsecase: UpdateValidateInscriptionUsecase,
  ) {}

  @Patch(':inscriptionId/expires')
  async handle(
    @Param() param: UpdateValidateInscriptionRequest,
    @Query() query: UpdateValidateInscriptionRequest,
  ): Promise<UpdateValidateInscriptionResponse> {
    const input: UpdateValidateInscriptionInput = {
      inscriptionId: param.inscriptionId,
      expiresAt: query.expiresAt,
    };

    const response = await this.updateValidateInscriptionUsecase.execute(input);
    return UpdateValidateInscriptionPresenter.toHttp(response);
  }
}
