import { FindByIdEventOutput } from 'src/usecases/web/event/find-by-id/find-by-id.usecase';
import { FindByIdEventResponse } from './find-by-id.dto';

export class FindByEventPresenter {
  public static toHttp(output: FindByIdEventOutput): FindByIdEventResponse {
    const response: FindByIdEventOutput = {
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
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
      regionName: output.regionName,
      responsibles: output.responsibles,
    };

    return response;
  }
}
