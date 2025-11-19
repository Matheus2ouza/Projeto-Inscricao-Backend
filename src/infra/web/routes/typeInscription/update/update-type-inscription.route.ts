import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  UpdateTypeInscriptionInput,
  UpdateTypeInscriptionUsecase,
} from 'src/usecases/web/typeInscription/update/update-type-inscription.usecase';
import type {
  UpdateTypeInscriptionRequest,
  UpdateTypeInscriptionResponse,
} from './update-type-inscription.dto';
import { UpdateTypeInscriptionPresenter } from './update-type-inscription.presenter';

@Controller('type-inscription')
export class UpdateTypeInscriptionRoute {
  public constructor(
    private readonly updateTypeInscriptionUsecase: UpdateTypeInscriptionUsecase,
  ) {}

  @Put(':id/update')
  async handle(
    @Param('id') typeInscriptionId: string,
    @Body() body: UpdateTypeInscriptionRequest,
  ): Promise<UpdateTypeInscriptionResponse> {
    const input: UpdateTypeInscriptionInput = {
      id: typeInscriptionId,
      description: body.description,
      value: body.value,
      specialType: body.specialType,
    };
    console.log(input);

    const response = await this.updateTypeInscriptionUsecase.execute(input);
    return UpdateTypeInscriptionPresenter.toHttp(response);
  }
}
