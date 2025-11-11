import { statusEvent } from 'generated/prisma';
import { Event } from '../entities/event.entity';

export abstract class EventGateway {
  abstract create(event: Event): Promise<Event>;
  abstract updateInscription(id: string, status: statusEvent): Promise<Event>;
  abstract updatePayment(id: string, status: boolean): Promise<Event>;
  abstract findById(id: string): Promise<Event | null>;
  abstract findByRegion(regionId: string): Promise<Event[]>;
  abstract paymentEnabled(eventId: string): Promise<void>;
  abstract paymentDisabled(eventId: string): Promise<void>;
  abstract paymentCheck(eventId: string): Promise<boolean>;
  abstract update(event: Event): Promise<Event>;
  abstract delete(id: string): Promise<void>;
  abstract updateImage(id: string, imageUrl: string): Promise<Event>;
  abstract findByNameAndRegionId(
    name: string,
    regionId: string,
  ): Promise<Event | null>;
  abstract findAll(): Promise<Event[]>;
  abstract countTypesInscriptions(id: string): Promise<number>;
  abstract incrementQuantityParticipants(
    id: string,
    quantity: number,
  ): Promise<Event>;
  abstract decremntQuantityParticipants(
    id: string,
    quantity: number,
  ): Promise<Event>;
  abstract findAllCarousel(): Promise<
    {
      id: string;
      name: string;
      location: string;
      imageUrl: string;
    }[]
  >;
  abstract incrementAmountCollected(id: string, value: number): Promise<Event>;
  abstract decrementAmountCollected(id: string, value: number): Promise<Event>;

  //PDF
  abstract findBasicDataForPdf(eventId: string): Promise<Event | null>;
}
