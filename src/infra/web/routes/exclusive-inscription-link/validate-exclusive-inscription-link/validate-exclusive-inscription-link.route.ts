import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  ValidateExclusiveInscriptionLinkInput,
  ValidateExclusiveInscriptionLinkUsecase,
} from 'src/usecases/web/exclusive-inscription-link/validate-exclusive-inscription-link/validate-exclusive-inscription-link.usecase';
import { ValidateExclusiveInscriptionLinkParams } from './validate-exclusive-inscription-link.dto';

@Controller('exclusive-inscription')
export class ValidateExclusiveInscriptionLinkRoute {
  constructor(
    private readonly validateExclusiveInscriptionLinkUsecase: ValidateExclusiveInscriptionLinkUsecase,
  ) {}

  @IsPublic ()
  @Get('/:token/validate')
  @HttpCode(204)
  async handle(
    @Param() params: ValidateExclusiveInscriptionLinkParams,
  ): Promise<void> {
    const input: ValidateExclusiveInscriptionLinkInput = {
      token: params.token,
    };

    await this.validateExclusiveInscriptionLinkUsecase.execute(input);
  }
}
