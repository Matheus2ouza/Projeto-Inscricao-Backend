import { FindDetailsEventOutput } from 'src/usecases/web/event/find-details/find-details-event.usecase';
import { FindDetailsEventResponse } from './find-details-event.dto';

export class FindDetailsEventPresenter {
  public static toHttp(
    output: FindDetailsEventOutput,
  ): FindDetailsEventResponse {
    return {
      id: output.id,
      name: output.name,
      startDate: output.startDate,
      endDate: output.endDate,
      imageUrl: output.imageUrl,
      location: output.location,
      longitude: output.longitude,
      latitude: output.latitude,
      status: output.status,
      paymentEnabled: output.paymentEnabled,
      regionName: output.regionName,
      typeInscriptions: output.typeInscriptions,
    };
  }
}
