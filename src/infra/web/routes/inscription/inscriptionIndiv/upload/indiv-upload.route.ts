import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  UploadValidateIndivInput,
  UploadValidateIndivUsecase,
} from 'src/usecases/inscription/indiv/upload-valide-indiv.usecase';
import type {
  IndivUploadRequest,
  IndivUploadRouteResponse,
} from './indiv-upload.dto';
import { IndivUploadPresenter } from './indiv-upload.presenter';

@Controller('inscriptions/indiv')
export class IndivUploadRoute {
  public constructor(
    private readonly uploadValidateIndivUsecase: UploadValidateIndivUsecase,
  ) {}

  @Post('upload')
  public async handle(
    @Body() request: IndivUploadRequest,
    @UserId() accountId: string,
  ): Promise<IndivUploadRouteResponse> {
    const { participant } = request;
    const input: UploadValidateIndivInput = {
      responsible: request.responsible,
      phone: request.phone,
      eventId: request.eventId,
      accountId,
      participant: {
        name: participant.name,
        birthDateStr: participant.birthDateStr,
        gender: participant.gender,
        typeDescription: participant.typeDescription,
      },
    };

    const result = await this.uploadValidateIndivUsecase.execute(input);
    const response = IndivUploadPresenter.toHttp(result);
    return response;
  }
}
