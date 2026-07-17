import { FindByIdEventOutput } from 'src/usecases/web/event/find-by-id/find-by-id.usecase';
import { FindByIdEventResponse } from './find-by-id.dto';

export class FindByEventPresenter {
  public static toHttp(output: FindByIdEventOutput): FindByIdEventResponse {
    return {
      id: output.id,
      name: output.name,
      quantityParticipants: output.quantityParticipants,
      amountCollected: output.amountCollected,
      startDate: output.startDate,
      endDate: output.endDate,
      image: output.image,
      logo: output.logo,
      location: output.location,
      longitude: output.longitude,
      latitude: output.latitude,
      status: output.status,
      allowedInscriptionModes: output.allowedInscriptionModes,
      allowedPaymentModes: output.allowedPaymentModes,
      paymentEnebled: output.paymentEnebled,
      createdAt: output.createdAt,
      regionName: output.regionName,
      participanteConfig: output.participanteConfig,
      responsibles: output.responsibles,
    };
  }
}
