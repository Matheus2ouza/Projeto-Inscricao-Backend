import Decimal from 'decimal.js';
import { Event } from 'src/domain/entities/event.entity';
import EventPrismaModel from '../event.prisma.model';

export class EventEntityToEventPrismaModelMapper {
  public static map(event: Event): EventPrismaModel {
    return {
      id: event.getId(),
      name: event.getName(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      quantityParticipants: event.getQuantityParticipants(),
      amountCollected: new Decimal(event.getAmountCollected()),
      status: event.getStatus(),
      paymentEnabled: event.getPaymentEnabled(),
      ticketEnabled: event.getTicketEnabled() ?? false,
      imageUrl: event.getImageUrl() ?? null,
      logoUrl: event.getLogoUrl() ?? null,
      location: event.getLocation() ?? null,
      longitude: event.getLongitude() ?? null,
      latitude: event.getLatitude() ?? null,
      regionId: event.getRegionId(),
      allowCard: event.getAllowCard() ?? false,
      allowGuest: event.getAllowGuest(),
      createdAt: event.getCreatedAt(),
      updatedAt: event.getUpdatedAt(),
    };
  }
}
