import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { Event } from 'src/domain/entities/event.entity';
import { Region } from 'src/domain/entities/region.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PrismaService } from '../prisma.service';
import { RegionPrismaModelToRegionEntityMapper } from '../region/model/mappers/region-prisma-model-to-region-entity.mapper';
import { EventEntityToEventPrismaModelMapper } from './model/mappers/event-entity-to-event-prisma-model.mapper';
import { EventPrismaModelToEventEntityMapper } from './model/mappers/event-prisma-model-to-event-entity.mapper';

@Injectable()
export class EventPrismaRepository implements EventGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(event: Event): Promise<Event> {
    const data = EventEntityToEventPrismaModelMapper.map(event);
    const created = await this.prisma.events.create({ data });
    return EventPrismaModelToEventEntityMapper.map(created);
  }

  async updatePayment(id: string, status: boolean): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: {
        paymentEnabled: status,
      },
    });
    return EventPrismaModelToEventEntityMapper.map(data);
  }

  async updateInscription(id: string, status: statusEvent): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: { status },
    });
    return EventPrismaModelToEventEntityMapper.map(data);
  }

  async update(event: Event): Promise<Event> {
    const data = EventEntityToEventPrismaModelMapper.map(event);
    const updated = await this.prisma.events.update({
      where: { id: event.getId() },
      data,
    });
    return EventPrismaModelToEventEntityMapper.map(updated);
  }

  async updateImage(id: string, imageUrl: string): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: { imageUrl },
    });
    return EventPrismaModelToEventEntityMapper.map(data);
  }

  async paymentEnabled(eventId: string): Promise<void> {
    await this.prisma.events.update({
      where: { id: eventId },
      data: { paymentEnabled: true },
    });
  }

  async paymentDisabled(eventId: string): Promise<void> {
    await this.prisma.events.update({
      where: { id: eventId },
      data: { paymentEnabled: false },
    });
  }

  async paymentCheck(eventId: string): Promise<boolean> {
    const event = await this.prisma.events.findUnique({
      where: { id: eventId },
      select: { paymentEnabled: true },
    });

    if (!event) {
      return false;
    }

    return event.paymentEnabled;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.events.delete({ where: { id } });
  }

  async findById(id: string): Promise<Event | null> {
    const found = await this.prisma.events.findUnique({
      where: { id },
      include: { region: { select: { name: true } } },
    });
    return found ? EventPrismaModelToEventEntityMapper.map(found) : null;
  }

  async findByRegion(regionId: string): Promise<Event[]> {
    const found = await this.prisma.events.findMany({ where: { regionId } });
    return found.map(EventPrismaModelToEventEntityMapper.map);
  }

  async findRegionById(regionId: string): Promise<Region | null> {
    const found = await this.prisma.regions.findUnique({
      where: { id: regionId },
    });
    return found ? RegionPrismaModelToRegionEntityMapper.map(found) : null;
  }

  async findByNameAndRegionId(
    name: string,
    regionId: string,
  ): Promise<Event | null> {
    const found = await this.prisma.events.findFirst({
      where: { name, regionId },
    });
    return found ? EventPrismaModelToEventEntityMapper.map(found) : null;
  }

  async findAll(): Promise<Event[]> {
    const found = await this.prisma.events.findMany({
      include: { region: { select: { name: true } } },
    });
    return found.map(EventPrismaModelToEventEntityMapper.map);
  }

  async countTypesInscriptions(id: string): Promise<number> {
    const count = await this.prisma.typeInscriptions.count({
      where: { eventId: id },
    });

    return count;
  }

  async incrementQuantityParticipants(
    id: string,
    quantity: number,
  ): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: { quantityParticipants: { increment: quantity } },
    });
    return EventPrismaModelToEventEntityMapper.map(data);
  }

  async decremntQuantityParticipants(
    id: string,
    quantity: number,
  ): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: {
        quantityParticipants: { decrement: quantity },
      },
    });
    return EventPrismaModelToEventEntityMapper.map(data);
  }

  async findAllCarousel(): Promise<
    { id: string; name: string; location: string; imageUrl: string }[]
  > {
    const data = await this.prisma.events.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' }, // <- ordena do mais novo para o mais antigo
      select: { id: true, name: true, location: true, imageUrl: true },
    });

    return data.map((event) => ({
      id: event.id,
      name: event.name,
      location: event.location || '',
      imageUrl: event.imageUrl || '',
    }));
  }

  async incrementAmountCollected(id: string, value: number): Promise<Event> {
    const aModel = await this.prisma.events.update({
      where: { id },
      data: { amountCollected: { increment: value } },
    });

    return EventPrismaModelToEventEntityMapper.map(aModel);
  }

  async decrementAmountCollected(id: string, value: number): Promise<Event> {
    const aModel = await this.prisma.events.update({
      where: { id },
      data: { amountCollected: { decrement: value } },
    });

    return EventPrismaModelToEventEntityMapper.map(aModel);
  }

  //PDF
  async findBasicDataForPdf(eventId: string): Promise<Event | null> {
    const found = await this.prisma.events.findUnique({
      where: { id: eventId },
    });
    return found ? EventPrismaModelToEventEntityMapper.map(found) : null;
  }
}
