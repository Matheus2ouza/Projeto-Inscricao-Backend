import Decimal from 'decimal.js';
import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import OnSiteRegistrationPrismaModel from '../on-site-registration.prisma.model';

export class OnSiteRegistrationEntityToOnSiteRegistrationPrismaModelMapper {
  public static map(
    onSiteRegistration: OnSiteRegistration,
  ): OnSiteRegistrationPrismaModel {
    const aModel: OnSiteRegistrationPrismaModel = {
      id: onSiteRegistration.getId(),
      eventId: onSiteRegistration.getEventId(),
      accountId: onSiteRegistration.getAccountId(),
      responsible: onSiteRegistration.getResponsible(),
      phone: onSiteRegistration.getPhone(),
      paymentMethod: onSiteRegistration.getPaymentMethod(),
      totalValue: new Decimal(onSiteRegistration.getTotalValue()),
      status: onSiteRegistration.getStatus(),
      createdAt: onSiteRegistration.getCreatedAt(),
      updatedAt: onSiteRegistration.getUpdatedAt(),
    };
    return aModel;
  }
}
