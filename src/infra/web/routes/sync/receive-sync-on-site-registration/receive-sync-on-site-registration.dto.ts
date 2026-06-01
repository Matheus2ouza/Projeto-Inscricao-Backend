import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';

export type ReceiveSyncOnSiteRegistrationBody = {
  onSiteRegistration: OnSiteRegistration;
};

export type ReceiveSyncOnSiteRegistrationResponse = {
  id: string;
  operation: 'created' | 'updated';
};
