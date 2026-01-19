import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  UpdateInscriptionInput,
  UpdateInscriptionUsecase,
} from 'src/usecases/web/inscription/update-inscription/update-inscription.usecase';
import type {
  UpdateInscriptionRequest,
  UpdateInscriptionResponse,
} from './update-inscription.dto';
import { UpdateInscriptionPresenter } from './update-inscription.presenter';

@Controller('inscriptions')
export class UpdateInscriptionRoute {
  public constructor(
    private readonly updateInscriptionUsecase: UpdateInscriptionUsecase,
  ) {}

  @Put(':id')
  public async handle(
    @Param('id') inscriptionId: string,
    @Body() body: UpdateInscriptionRequest,
  ): Promise<UpdateInscriptionResponse> {
    const input: UpdateInscriptionInput = {
      id: inscriptionId,
      responsible: body.responsible,
      phone: body.phone,
      email: body.email,
    };

    const response = await this.updateInscriptionUsecase.execute(input);
    return UpdateInscriptionPresenter.toHttp(response);
  }
}
