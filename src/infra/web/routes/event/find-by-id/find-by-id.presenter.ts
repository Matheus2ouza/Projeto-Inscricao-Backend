import { FindByIdEventOutput } from 'src/usecases/web/event/find-by-id/find-by-id.usecase';
import { FindByIdEventResponse } from './find-by-id.dto';

export class FindByEventPresenter {
  public static toHttp(input: FindByIdEventOutput): FindByIdEventResponse {
    const response: FindByIdEventOutput = {
      id: input.id,
      name: input.name,
      quantityParticipants: input.quantityParticipants,
      amountCollected: input.amountCollected,
      startDate: input.startDate,
      endDate: input.endDate,
      imageUrl: input.imageUrl,
      location: input.location,
      longitude: input.longitude,
      latitude: input.latitude,
      status: input.status,
      paymentEnebled: input.paymentEnebled,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      regionName: input.regionName,
      responsibles: input.responsibles,
    };

    return response;
  }
}
