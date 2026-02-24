import { PaymentLink } from 'src/domain/entities/payment-link.entity';
import PaymentLinkPrismaModel from '../payment-link.prisma.model';

export class PaymentLinkPrismaModelToPaymentLinkEntityMapper {
  public static map(paymentLink: PaymentLinkPrismaModel): PaymentLink {
    return PaymentLink.with({
      id: paymentLink.id,
      name: paymentLink.name,
      description: paymentLink.description,
      value: Number(paymentLink.value),
      asaasPaymentLinkId: paymentLink.asaasPaymentLinkId,
      url: paymentLink.url,
      active: paymentLink.active,
      endDateAt: paymentLink.endDateAt,
      createdAt: paymentLink.createdAt,
      updatedAt: paymentLink.updatedAt,
    });
  }
}
