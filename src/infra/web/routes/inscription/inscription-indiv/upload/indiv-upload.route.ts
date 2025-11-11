import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  IndivUploadValidateInput,
  IndivUploadValidateUsecase,
} from 'src/usecases/inscription/indiv/upload/indiv-upload-valide.usecase';
import type {
  IndivUploadRequest,
  IndivUploadRouteResponse,
} from './indiv-upload.dto';
import { IndivUploadPresenter } from './indiv-upload.presenter';

@Controller('inscriptions/indiv')
export class IndivUploadRoute {
  public constructor(
    private readonly uploadValidateIndivUsecase: IndivUploadValidateUsecase,
  ) {}

  @Post('upload')
  public async handle(
    @Body() request: IndivUploadRequest,
    @UserId() accountId: string,
  ): Promise<IndivUploadRouteResponse> {
    const { participant } = request;
    const input: IndivUploadValidateInput = {
      responsible: request.responsible,
      email: request.email,
      phone: request.phone,
      eventId: request.eventId,
      accountId,
      participant: {
        name: participant.name,
        birthDateStr: participant.birthDateStr,
        gender: participant.gender,
        typeDescriptionId: participant.typeDescriptionId,
      },
    };

    try {
      const result = await this.uploadValidateIndivUsecase.execute(input);
      const response = IndivUploadPresenter.toHttp(result);
      return response;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(e);
      throw new BadRequestException(msg);
    }
  }
}
