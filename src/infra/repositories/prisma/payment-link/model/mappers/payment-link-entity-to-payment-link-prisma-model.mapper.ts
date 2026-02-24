import Decimal from 'decimal.js';
import { PaymentLink } from 'src/domain/entities/payment-link.entity';
import PaymentLinkPrismaModel from '../payment-link.prisma.model';

export class PaymentLinktEntityToPaymenLinkPrismaModelMapper {
  public static map(paymenLink: PaymentLink): PaymentLinkPrismaModel {
    return {
      id: paymenLink.getId(),
      name: paymenLink.getName(),
      description: paymenLink.getDescription(),
      value: Decimal(paymenLink.getValue()),
      asaasPaymentLinkId: paymenLink.getAsaasPaymentLinkId(),
      url: paymenLink.getUrl(),
      active: paymenLink.getActive(),
      endDateAt: paymenLink.getEndDateAt(),
      createdAt: paymenLink.getCreatedAt(),
      updatedAt: paymenLink.getUpdatedAt(),
    };
  }
}
