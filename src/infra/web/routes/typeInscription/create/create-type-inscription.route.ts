import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateTypeInscriptionInput,
  CreateTypeInscriptionUseCase,
} from 'src/usecases/typeInscription/create/create-type-inscription.usecase';
import type {
  CreateTypeInscriptionRequest,
  CreateTypeInscriptionResponse,
} from './create-type-inscription.dto';
import { CreateTypeInscriptionPresenter } from './create-type-inscription.presenter';

@Controller('type-inscription')
export class CreateTypeInscriptionRoute {
  public constructor(
    private readonly createTypeInscriptionUseCase: CreateTypeInscriptionUseCase,
  ) {}

  @Post('create')
  public async handle(
    @Body() request: CreateTypeInscriptionRequest,
  ): Promise<CreateTypeInscriptionResponse> {
    const input: CreateTypeInscriptionInput = {
      description: request.description,
      value: request.value,
      eventId: request.eventId,
    };
    const result = await this.createTypeInscriptionUseCase.execute(input);

    const response = CreateTypeInscriptionPresenter.toHttp(result);
    return response;
  }
}
