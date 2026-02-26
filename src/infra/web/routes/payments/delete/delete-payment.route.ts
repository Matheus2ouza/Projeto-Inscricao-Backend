import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  DeletePaymentInput,
  DeletePaymentUsecase,
} from 'src/usecases/web/payments/delete/delete-payment.usecase';
import type { DeletePaymentRequest } from './delete-payment.dto';

@Controller('payments')
export class DeletePaymentRoute {
  constructor(private readonly deletePaymentUsecase: DeletePaymentUsecase) {}

  @IsPublic()
  @Delete('/:id')
  @HttpCode(204)
  async handle(@Param() param: DeletePaymentRequest): Promise<void> {
    const input: DeletePaymentInput = {
      id: param.id,
    };

    await this.deletePaymentUsecase.execute(input);
  }
}
