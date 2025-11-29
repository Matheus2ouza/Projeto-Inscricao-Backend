import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type TicketUnitCreateDto = {
  ticketSaleItemId: string;
  qrCode: string;
};

export type TicketUnitCreateWithDto = {
  id: string;
  ticketSaleItemId: string;
  qrCode: string;
  usedAt: Date | null;
  createdAt: Date;
};

export class TicketUnit extends Entity {
  private constructor(
    id: string,
    private readonly ticketSaleItemId: string,
    private readonly qrCode: string,
    private usedAt: Date | null,
    createdAt: Date,
  ) {
    super(id, createdAt, createdAt);
    this.validate();
  }

  public static create({
    ticketSaleItemId,
    qrCode,
  }: TicketUnitCreateDto): TicketUnit {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const usedAt = null;

    return new TicketUnit(id, ticketSaleItemId, qrCode, usedAt, createdAt);
  }

  public static with({
    id,
    ticketSaleItemId,
    qrCode,
    usedAt,
    createdAt,
  }: TicketUnitCreateWithDto): TicketUnit {
    return new TicketUnit(id, ticketSaleItemId, qrCode, usedAt, createdAt);
  }

  protected validate(): void {
    if (!this.ticketSaleItemId) {
      throw new Error('ticketSaleItemId é obrigatório');
    }

    if (!this.qrCode || this.qrCode.trim().length === 0) {
      throw new Error('qrCode é obrigatório');
    }
  }

  // ======= GETTERS =======

  public getTicketSaleItemId(): string {
    return this.ticketSaleItemId;
  }

  public getQrCode(): string {
    return this.qrCode;
  }

  public getUsedAt(): Date | null {
    return this.usedAt;
  }

  public isUsed(): boolean {
    return this.usedAt !== null;
  }

  public markAsUsed(): void {
    if (this.usedAt !== null) {
      throw new Error('Este ticket já foi utilizado');
    }
    this.usedAt = new Date();
  }
}
