export class Event {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly date: Date,
    private readonly regionId: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  public getId(): string {
    return this.id;
  }
  public getName(): string {
    return this.name;
  }
  public getDate(): Date {
    return this.date;
  }
  public getRegionId(): string {
    return this.regionId;
  }
  public getCreatedAt(): Date {
    return this.createdAt;
  }
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  static create({
    id,
    name,
    date,
    regionId,
    createdAt,
    updatedAt,
  }: {
    id: string;
    name: string;
    date: Date;
    regionId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Event {
    return new Event(id, name, date, regionId, createdAt, updatedAt);
  }
}
