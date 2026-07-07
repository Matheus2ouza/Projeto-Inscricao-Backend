import { Utils } from 'src/shared/utils/utils';
import { EventSlugValidatorFactory } from '../factories/event-slug/event-slug.vaidator.factory';
import { Entity } from '../shared/entities/entity';

export type EventSlugCreateDto = {
  slug: string;
  eventId: string;
};

export type EventSlugWithDto = {
  id: string;
  slug: string;
  eventId: string;
  isCurrent: boolean;
  clickCount: number;
  createdAt: Date;
};

export class EventSlug extends Entity {
  private constructor(
    id: string,
    private slug: string,
    private eventId: string,
    private isCurrent: boolean,
    private clickCount: number,
    createdAt: Date,
  ) {
    super(id, createdAt, createdAt);
    this.validate();
  }

  public static create({ slug, eventId }: EventSlugCreateDto): EventSlug {
    const id = Utils.generateUUID();
    const isCurrent = true;
    const clickCount = 0;
    const createdAt = new Date();

    return new EventSlug(id, slug, eventId, isCurrent, clickCount, createdAt);
  }

  public static with({
    id,
    slug,
    eventId,
    isCurrent,
    clickCount,
    createdAt,
  }: EventSlugWithDto) {
    return new EventSlug(id, slug, eventId, isCurrent, clickCount, createdAt);
  }

  protected validate(): void {
    EventSlugValidatorFactory.create().validate(this);
  }

  public getSlug(): string {
    return this.slug;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getIsCurrent(): boolean {
    return this.isCurrent;
  }

  public getClickCount(): number {
    return this.clickCount;
  }
}
