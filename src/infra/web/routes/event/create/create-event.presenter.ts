import { Event } from 'src/domain/entities/event.entity';

export class CreateEventPresenter {
  id: string;
  name: string;
  date: Date;
  regionId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(event: Event) {
    this.id = event.getId();
    this.name = event.getName();
    this.date = event.getDate();
    this.regionId = event.getRegionId();
    this.createdAt = event.getCreatedAt();
    this.updatedAt = event.getUpdatedAt();
  }
}
