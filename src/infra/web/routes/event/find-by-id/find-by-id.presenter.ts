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
      imageUrl: output.imageUrl,
      logoUrl: output.logoUrl,
      location: output.location,
      longitude: output.longitude,
      latitude: output.latitude,
      status: output.status,
      paymentEnebled: output.paymentEnebled,
      allowCard: output.allowCard ?? false,
      allowGuest: output.allowGuest,
      createdAt: output.createdAt,
      regionName: output.regionName,
      responsibles: output.responsibles,
    };
  }
}
