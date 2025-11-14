import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  DeletePaymentInscriptionInput,
  DeletePaymentInscriptionUsecase,
} from 'src/usecases/web/paymentInscription/delete/delete-inscription.usecase';
import type { DeletePaymentInscriptionRequest } from './delete-payment-inscription.dto';

@Controller('payments')
export class DeletePaymentInscriptionRoute {
  public constructor(
    private readonly deletePaymentInscriptionUsecase: DeletePaymentInscriptionUsecase,
  ) {}

  @Delete(':id/delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui um pagamento de inscrição',
    description:
      'Remove permanentemente um pagamento cadastrado para uma inscrição. Ideal para desfazer envios duplicados, comprovantes inválidos ou liberar um novo envio durante a análise. ' +
      '**Atenção:** esta ação é **irreversível** e também remove o comprovante salvo no storage.',
  })
  @ApiResponse({
    status: 204,
    description: 'Pagamento removido com sucesso (sem conteúdo retornado).',
  })
  @ApiResponse({
    status: 404,
    description: 'Pagamento não encontrado.',
  })
  async handle(@Param() param: DeletePaymentInscriptionRequest): Promise<void> {
    const input: DeletePaymentInscriptionInput = {
      paymentInscriptionId: param.id,
    };

    await this.deletePaymentInscriptionUsecase.execute(input);
  }
}
