import { PaymentMethod } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type TicketSalePaymentCreateDto = {
  ticketSaleId: string;
  paymentMethod: PaymentMethod;
  value: number;
  imageUrl: string;
  financialMovementId?: string;
};

export type TicketSalePaymentWithDto = {
  id: string;
  ticketSaleId: string;
  paymentMethod: PaymentMethod;
  value: number;
  imageUrl: string;
  financialMovementId?: string;
  createdAt: Date;
};

export class TicketSalePayment extends Entity {
  private constructor(
    id: string,
    private ticketSaleId: string,
    private paymentMethod: PaymentMethod,
    private value: number,
    private imageUrl: string,
    createdAt: Date,
    private financialMovementId?: string,
  ) {
    super(id, createdAt, createdAt);
    this.validate();
  }

  public static create({
    ticketSaleId,
    paymentMethod,
    value,
    imageUrl,
    financialMovementId,
  }: TicketSalePaymentCreateDto): TicketSalePayment {
    const id = Utils.generateUUID();
    const createdAt = new Date();

    return new TicketSalePayment(
      id,
      ticketSaleId,
      paymentMethod,
      value,
      imageUrl,
      createdAt,
      financialMovementId,
    );
  }

  public static with({
    id,
    ticketSaleId,
    paymentMethod,
    value,
    imageUrl,
    financialMovementId,
    createdAt,
  }: TicketSalePaymentWithDto): TicketSalePayment {
    return new TicketSalePayment(
      id,
      ticketSaleId,
      paymentMethod,
      value,
      imageUrl,
      createdAt,
      financialMovementId,
    );
  }

  protected validate(): void {
    if (!this.ticketSaleId) {
      throw new Error('O ID da venda do ticket é obrigatório.');
    }

    if (!this.paymentMethod) {
      throw new Error('O método de pagamento é obrigatório.');
    }

    if (this.value <= 0) {
      throw new Error('O valor do pagamento deve ser maior que zero.');
    }

    if (!this.imageUrl) {
      throw new Error('A URL da imagem é obrigatória.');
    }
  }

  public getId(): string {
    return this.id;
  }

  public getTicketSaleId(): string {
    return this.ticketSaleId;
  }

  public getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  public getValue(): number {
    return this.value;
  }

  public getImageUrl(): string {
    return this.imageUrl;
  }

  public getFinancialMovementId(): string | undefined {
    return this.financialMovementId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public attachFinancialMovement(financialMovementId: string): void {
    this.financialMovementId = financialMovementId;
    this.updatedAt = new Date();
  }
}
