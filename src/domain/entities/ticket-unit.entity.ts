import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type TicketUnitCreateDto = {
  ticketSaleId: string;
  qrCode: string;
};

export type TicketUnitCreateWithDto = {
  id: string;
  ticketSaleId: string;
  qrCode: string;
  usedAt: Date | null;
  createdAt: Date;
};

export class TicketUnit extends Entity {
  private constructor(
    id: string,
    private readonly ticketSaleId: string,
    private readonly qrCode: string,
    private usedAt: Date | null,
    createdAt: Date,
  ) {
    super(id, createdAt, createdAt); // TicketUnit não tem updatedAt (fixo)
    this.validate();
  }

  public static create({
    ticketSaleId,
    qrCode,
  }: TicketUnitCreateDto): TicketUnit {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const usedAt = null;

    return new TicketUnit(id, ticketSaleId, qrCode, usedAt, createdAt);
  }

  public static with({
    id,
    ticketSaleId,
    qrCode,
    usedAt,
    createdAt,
  }: TicketUnitCreateWithDto): TicketUnit {
    return new TicketUnit(id, ticketSaleId, qrCode, usedAt, createdAt);
  }

  protected validate(): void {
    if (!this.ticketSaleId) {
      throw new Error('ticketSaleId é obrigatório');
    }

    if (!this.qrCode || this.qrCode.trim().length === 0) {
      throw new Error('qrCode é obrigatório');
    }
  }

  // ======= GETTERS =======

  public getTicketSaleId(): string {
    return this.ticketSaleId;
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
