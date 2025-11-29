import { TicketSaleStatus } from 'generated/prisma';

export class ApprovePreSaleRequest {
  accountId: string;
  ticketSaleId: string;
}

export class ApprovePreSaleResponse {
  ticketSaleId: string;
  status: TicketSaleStatus;
}
