import { statusEvent } from 'generated/prisma';
import { Event } from '../entities/event.entity';

export abstract class EventGateway {
  // CRUD básico
  abstract create(event: Event): Promise<Event>;
  abstract update(event: Event): Promise<Event>;
  abstract delete(id: string): Promise<void>;
  abstract updateImage(id: string, imageUrl: string): Promise<Event>;
  abstract updateLogo(id: string, logoUrl: string): Promise<Event>;

  // Atualizações de status e pagamento
  abstract updateInscription(id: string, status: statusEvent): Promise<Event>;
  abstract updatePayment(id: string, status: boolean): Promise<Event>;
  abstract paymentEnabled(eventId: string): Promise<void>;
  abstract paymentDisabled(eventId: string): Promise<void>;
  abstract paymentCheck(eventId: string): Promise<boolean>;

  //Deletes
  abstract deleteImage(id: string): Promise<void>;
  abstract deleteLogo(id: string): Promise<void>;

  // Buscas e listagens
  abstract findById(id: string): Promise<Event | null>;
  abstract findByRegion(regionId: string): Promise<Event[]>;
  abstract findByNameAndRegionId(
    name: string,
    regionId: string,
  ): Promise<Event | null>;
  abstract findAll(): Promise<Event[]>;
  abstract findAllPaginated(page: number, pageSize: number): Promise<Event[]>;
  abstract findAllFiltered(filters: {
    status?: string[];
    page: number;
    pageSize: number;
  }): Promise<Event[]>;
  abstract findAllCarousel(): Promise<
    {
      id: string;
      name: string;
      location: string;
      imageUrl: string;
    }[]
  >;
  abstract findNextUpcomingEvent(regionId: string): Promise<Event | null>;
  abstract findEventDates(regionId: string): Promise<Event[]>;

  // Agregações e contagens
  abstract countEventsActive(regionId: string): Promise<number>;
  abstract countAllFiltered(filters: { status?: string[] }): Promise<number>;
  abstract countTypesInscriptions(id: string): Promise<number>;
  abstract incrementQuantityParticipants(
    id: string,
    quantity: number,
  ): Promise<Event>;
  abstract decrementQuantityParticipants(
    id: string,
    quantity: number,
  ): Promise<Event>;
  abstract incrementAmountCollected(id: string, value: number): Promise<Event>;
  abstract decrementAmountCollected(id: string, value: number): Promise<Event>;

  //PDF
  abstract findBasicDataForPdf(eventId: string): Promise<Event | null>;
}
