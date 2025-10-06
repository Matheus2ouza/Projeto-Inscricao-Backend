import { Event } from 'src/domain/entities/event.entity';
import EventPrismaModel from '../event.prisma.model';
import Decimal from 'decimal.js';

export class EventEntityToEventPrismaModelMapper {
  public static map(event: Event): EventPrismaModel {
    return {
      id: event.getId(),
      name: event.getName(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      quantityParticipants: event.getQuantityParticipants(),
      amountCollected: new Decimal(event.getAmountCollected()),
      imageUrl: event.getImageUrl() ?? null,
      regionId: event.getRegionId(),
      createdAt: event.getCreatedAt(),
      updatedAt: event.getUpdatedAt(),
    };
  }
}
