import { Controller, Get, Param } from '@nestjs/common';
import {
  FindAccountWithInscriptionsInput,
  FindAccountWithInscriptionsUsecase,
} from 'src/usecases/web/event/inscription/find-accounts-with-inscriptions.usecase';
import { FindAccountWithInscriptionsResponse } from './find-accounts-with-inscriptions.dto';
import { FindAccountWithInscriptionsPresenter } from './find-accounts-with-inscriptions.presenter';

@Controller('events')
export class FindAccountWithInscriptionsRoute {
  public constructor(
    private readonly findAccountWithInscriptionsUsecase: FindAccountWithInscriptionsUsecase,
  ) {}

  @Get(':id/list-inscription')
  async handle(
    @Param('id') id: string,
  ): Promise<FindAccountWithInscriptionsResponse> {
    const input: FindAccountWithInscriptionsInput = {
      eventId: id,
    };

    const response =
      await this.findAccountWithInscriptionsUsecase.execute(input);
    return FindAccountWithInscriptionsPresenter.toHttp(response);
  }
}
