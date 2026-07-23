import { Event } from 'src/domain/entities/event/event.entity';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { Payment } from 'src/domain/entities/payment.entity';

export type PaymentEmailData = {
  event: Event;
  payment: Payment;
  inscriptions: Inscription[];
  allocations: PaymentAllocation[];
};

export type PaymentEmailTemplateData = PaymentEmailData;
