import { FindByIdEventOutput } from './find-by-id.dto';

export class FindByEventPresenter {
  public static toHttp(input: FindByIdEventOutput): FindByIdEventOutput {
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
      paymentEneble: input.paymentEneble,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      regionName: input.regionName,
    };

    return response;
  }
}
