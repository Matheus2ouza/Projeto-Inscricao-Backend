import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import { CreateInscriptionAvulUsecase } from 'src/usecases/inscriptionAvul/create/create-inscription-avul.usecase';
import type {
  CreateInscriptionAvulRequest,
  CreateInscriptionAvulResponse,
} from './create-inscription-avul.dto';
import { CreateInscriptionAvulPresenter } from './create-inscription-avul.presenter';

@Controller('inscriptions/avul')
export class CreateInscriptionAvulRoute {
  public constructor(
    private readonly createInscriptionAvulUsecase: CreateInscriptionAvulUsecase,
  ) {}

  @Post('create')
  async handle(
    @Body() body: CreateInscriptionAvulRequest,
    @UserId() accountId: string,
  ): Promise<CreateInscriptionAvulResponse> {
    // Monta o DTO de entrada para o usecase
    const data = {
      eventId: body.eventId,
      accountId, // vindo do decorator UserId
      responsible: body.responsible,
      phone: body.phone,
      totalValue: body.totalValue,
      status: body.status,
      paymentMethod: body.paymentMethod,
      participants: body.participants,
    };

    // Executa o caso de uso
    const response = await this.createInscriptionAvulUsecase.execute(data);

    // Retorna a resposta no formato esperado
    return CreateInscriptionAvulPresenter.toHtpp(response);
  }
}
