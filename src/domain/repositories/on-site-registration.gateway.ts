import { OnSiteRegistration } from '../entities/on-site-registration.entity';

export abstract class OnSiteRegistrationGateway {
  abstract create(
    onSiteRegistration: OnSiteRegistration,
  ): Promise<OnSiteRegistration>;

  abstract findManyPaginated(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<OnSiteRegistration[]>;

  abstract countAll(eventId: string): Promise<number>;
}
