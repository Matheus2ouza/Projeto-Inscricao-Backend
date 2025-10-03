import { Region } from 'src/domain/entities/region.entity';

export class CreateRegionPresenter {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(region: Region) {
    this.id = region.getId();
    this.name = region.getName();
    this.createdAt = region.getCreatedAt();
    this.updatedAt = region.getUpdatedAt();
  }
}
