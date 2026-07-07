import { FindBySlugEventOutput } from 'src/usecases/web/event/find-by-slug/find-by-slug.usecase';
import { FindBySlugEventResponse } from './find-by-slug.dto';

export class FindBySlugPresenter {
  public static toHttp(output: FindBySlugEventOutput): FindBySlugEventResponse {
    return {
      id: output.id,
      name: output.name,
      quantityParticipants: output.quantityParticipants,
      amountCollected: output.amountCollected,
      startDate: output.startDate,
      endDate: output.endDate,
      image: output.image,
      logoUrl: output.logoUrl,
      location: output.location,
      longitude: output.longitude,
      latitude: output.latitude,
      status: output.status,
      allowedInscriptionModes: output.allowedInscriptionModes,
      paymentEnebled: output.paymentEnebled,
      allowCard: output.allowCard ?? false,
      createdAt: output.createdAt,
      regionName: output.regionName,
      responsibles: output.responsibles,
    };
  }
}
