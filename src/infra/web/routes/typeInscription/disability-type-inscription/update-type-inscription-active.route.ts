import { Controller, Param, Patch, Query } from '@nestjs/common';
import {
  UpdateTypeInscriptionActiveInput,
  UpdateTypeInscriptionActiveUsecase,
} from 'src/usecases/web/typeInscription/disability-type-inscription/update-type-inscription-active.usecase';
import {
  UpdateTypeInscriptionActiveParms,
  UpdateTypeInscriptionActiveQuery,
  UpdateTypeInscriptionActiveResponse,
} from './update-type-inscription-active.dto';
import { UpdateTypeInscriptionActivePresenter } from './update-type-inscription-active.presenter';

@Controller('type-inscription')
export class UpdateTypeInscriptionActiveRoute {
  constructor(
    private readonly updateTypeInscriptionActiveUsecase: UpdateTypeInscriptionActiveUsecase,
  ) {}

  @Patch(':id/active')
  async handle(
    @Param() params: UpdateTypeInscriptionActiveParms,
    @Query() query: UpdateTypeInscriptionActiveQuery,
  ): Promise<UpdateTypeInscriptionActiveResponse> {
    const input: UpdateTypeInscriptionActiveInput = {
      id: params.id,
      active: query.active === 'true',
    };

    const response =
      await this.updateTypeInscriptionActiveUsecase.execute(input);
    return UpdateTypeInscriptionActivePresenter.toHttp(response);
  }
}
