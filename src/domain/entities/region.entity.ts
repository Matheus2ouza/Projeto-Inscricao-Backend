export class Region {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  public getId(): string {
    return this.id;
  }
  public getName(): string {
    return this.name;
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
    createdAt,
    updatedAt,
  }: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): Region {
    return new Region(id, name, createdAt, updatedAt);
  }
}
