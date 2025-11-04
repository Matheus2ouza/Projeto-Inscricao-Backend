import { Injectable } from '@nestjs/common';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { PaymentInscription } from 'src/domain/entities/payment-inscription';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { PrismaService } from '../prisma.service';
import { PaymentInscriptionEntityToPaymentInscriptionPrismaModelMapper } from './model/mapper/payment-inscription-entity-to-payment-inscription-prisma-model.mapper';
import { PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper } from './model/mapper/payment-inscription-prisma-model-to-payment-inscription-entity.mapper';

@Injectable()
export class PaymentInscriptionRepository implements PaymentInscriptionGateway {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    paymentInscription: PaymentInscription,
  ): Promise<PaymentInscription> {
    const data =
      PaymentInscriptionEntityToPaymentInscriptionPrismaModelMapper.map(
        paymentInscription,
      );
    const created = await this.prisma.paymentInscription.create({ data });
    return PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
      created,
    );
  }

  public async findById(id: string): Promise<PaymentInscription | null> {
    const aModel = await this.prisma.paymentInscription.findUnique({
      where: { id },
    });

    return aModel
      ? PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
          aModel,
        )
      : null;
  }

  public async findbyInscriptionId(id: string): Promise<PaymentInscription[]> {
    const aModel = await this.prisma.paymentInscription.findMany({
      where: { inscriptionId: id },
    });

    return aModel.map(
      PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map,
    );
  }

  public async findToAnalysis(id: string): Promise<PaymentInscription[]> {
    const aModel = await this.prisma.paymentInscription.findMany({
      where: { inscriptionId: id, status: 'UNDER_REVIEW' },
    });

    return aModel.map(
      PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map,
    );
  }

  public async countAllByEvent(eventId: string): Promise<number> {
    const total = await this.prisma.paymentInscription.count({
      where: { eventId },
    });

    return total;
  }

  public async countAllInAnalysis(eventId: string): Promise<number> {
    const total = await this.prisma.paymentInscription.count({
      where: { eventId, status: 'UNDER_REVIEW' },
    });

    return total;
  }

  public async countAllByInscriptionId(inscriptionId: string): Promise<number> {
    const total = await this.prisma.paymentInscription.count({
      where: { inscriptionId },
    });
    return total;
  }

  public async approvedPayment(id: string): Promise<PaymentInscription> {
    const data = await this.prisma.paymentInscription.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });

    return PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
      data,
    );
  }

  public async approvePaymentWithTransaction(
    paymentId: string,
  ): Promise<PaymentInscription> {
    // Buscar o pagamento primeiro para obter os dados necessários
    const payment = await this.findById(paymentId);

    if (!payment) {
      throw new Error(`Payment with id ${paymentId} not found`);
    }

    // Criar a entidade de movimento financeiro
    const movement = FinancialMovement.create({
      eventId: payment.getEventId(),
      accountId: payment.getAccountId(),
      type: 'INCOME',
      value: payment.getValue(),
    });

    // Executar todas as operações em uma transação atômica
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Decrementar o valor total da inscrição
      const inscription = await tx.inscription.update({
        where: { id: payment.getInscriptionId() },
        data: { totalValue: { decrement: Number(payment.getValue()) } },
        select: { totalValue: true },
      });

      // 2. Criar movimento financeiro
      await tx.financialMovement.create({
        data: {
          id: movement.getId(),
          eventId: movement.getEventId(),
          accountId: movement.getAccountId(),
          type: movement.getType(),
          value: movement.getValue(),
          createdAt: movement.getCreatedAt(),
          updatedAt: movement.getUpdatedAt(),
        },
      });

      // 3. Incrementar valor arrecadado no evento
      await tx.events.update({
        where: { id: payment.getEventId() },
        data: { amountCollected: { increment: Number(payment.getValue()) } },
      });

      // 4. Atualiza o status da inscrição caso tenha quitado o saldo devedor
      if (Math.abs(Number(inscription.totalValue)) < 0.01) {
        await tx.inscription.update({
          where: { id: payment.getInscriptionId() },
          data: { status: 'PAID' },
        });
      }

      // 5. Aprovar o pagamento
      const approvedPayment = await tx.paymentInscription.update({
        where: { id: paymentId },
        data: { status: 'APPROVED' },
      });

      return approvedPayment;
    });

    return PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
      result,
    );
  }

  public async rejectedPayment(
    paymentId: string,
    rejectionReason?: string,
  ): Promise<PaymentInscription> {
    const payment = await this.prisma.paymentInscription.update({
      where: { id: paymentId },
      data: {
        status: 'REFUSED',
        rejectionReason: rejectionReason,
      },
    });
    return PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
      payment,
    );
  }
}
