import { Controller, Get, Param } from '@nestjs/common';
import {
  PreviewExclusiveInscriptionLinkInput,
  PreviewExclusiveInscriptionLinkUsecase,
} from 'src/usecases/web/exclusive-inscription-link/preview-exclusive-inscription-link/preview-exclusive-inscription-link.usecase';
import {
  PreviewExclusiveInscriptionLinkParams,
  PreviewExclusiveInscriptionLinkResponse,
} from './preview-exclusive-inscription-link.dto';
import { PreviewExclusiveInscriptionLinkPresenter } from './preview-exclusive-inscription-link.presenter';

@Controller('exclusive-inscription')
export class PreviewExclusiveInscriptionLinkRoute {
  constructor(
    private readonly previewExclusiveInscriptionLinkUsecase: PreviewExclusiveInscriptionLinkUsecase,
  ) {}

  @Get('/:token/preview')
  async handle(
    @Param() params: PreviewExclusiveInscriptionLinkParams,
  ): Promise<PreviewExclusiveInscriptionLinkResponse> {
    const input: PreviewExclusiveInscriptionLinkInput = {
      token: params.token,
    };

    const response =
      await this.previewExclusiveInscriptionLinkUsecase.execute(input);

    return PreviewExclusiveInscriptionLinkPresenter.toHttp(response);
  }
}
