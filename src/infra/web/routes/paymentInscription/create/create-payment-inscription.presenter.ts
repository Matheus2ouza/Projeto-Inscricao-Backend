import { CreatePaymentOutput } from 'src/usecases/paymentInscription/create/create-payment-inscription.usecase';
import { CreatePaymentInscriptionResponse } from './create-payment-inscription.dto';

export class CreatePaymentInscriptionPresenter {
  public static toHtpp(
    output: CreatePaymentOutput,
  ): CreatePaymentInscriptionResponse {
    const aModel: CreatePaymentOutput = {
      id: output.id,
    };
    return aModel;
  }
}
