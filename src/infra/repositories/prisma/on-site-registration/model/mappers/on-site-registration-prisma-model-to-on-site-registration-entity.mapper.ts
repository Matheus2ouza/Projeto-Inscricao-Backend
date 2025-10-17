import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import OnSiteRegistrationPrismaModel from '../on-site-registration.prisma.model';

export class OnSiteRegistrationPrismaModelToOnSiteRegistrationEntityMapper {
  public static map(
    onSiteRegistration: OnSiteRegistrationPrismaModel,
  ): OnSiteRegistration {
    const anOnSiteRegistration = OnSiteRegistration.with({
      id: onSiteRegistration.id,
      eventId: onSiteRegistration.eventId,
      accountId: onSiteRegistration.accountId,
      responsible: onSiteRegistration.responsible,
      phone: onSiteRegistration.phone,
      paymentMethod: onSiteRegistration.paymentMethod,
      totalValue: onSiteRegistration.totalValue,
      status: onSiteRegistration.status,
      createdAt: onSiteRegistration.createdAt,
      updatedAt: onSiteRegistration.updatedAt,
    });

    return anOnSiteRegistration;
  }
}
