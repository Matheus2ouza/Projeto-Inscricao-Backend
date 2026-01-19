import { Injectable, Logger } from '@nestjs/common';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { Usecase } from 'src/usecases/usecase';

export type CleanupCancelledTicketSalesInput = void;

export type CleanupCancelledTicketSalesOutput = {
  cutoffDate: Date;
  foundSales: number;
  deletedSales: number;
  deletedPayments: number;
  deletedItems: number;
};

@Injectable()
export class CleanupCancelledTicketSalesUsecase
  implements
    Usecase<CleanupCancelledTicketSalesInput, CleanupCancelledTicketSalesOutput>
{
  private readonly logger = new Logger(CleanupCancelledTicketSalesUsecase.name);

  public constructor(
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly ticketSaleItemGateway: TicketSaleItemGateway,
    private readonly ticketSalePaymentGateway: TicketSalePaymentGateway,
  ) {}

  public async execute(): Promise<CleanupCancelledTicketSalesOutput> {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    this.logger.log(
      `Iniciando limpeza de TicketSales canceladas antes de ${cutoffDate.toISOString()}`,
    );

    const cancelledSales =
      await this.ticketSaleGateway.findCancelledBefore(cutoffDate);

    if (!cancelledSales.length) {
      this.logger.log('Nenhuma TicketSale cancelada encontrada para limpeza');
      return {
        cutoffDate,
        foundSales: 0,
        deletedSales: 0,
        deletedPayments: 0,
        deletedItems: 0,
      };
    }

    const saleIds = cancelledSales.map((sale) => sale.getId());
    this.logger.log(
      `${saleIds.length} TicketSales canceladas serão removidas do sistema`,
    );

    const [deletedPayments, deletedItems] = await Promise.all([
      this.ticketSalePaymentGateway.deleteByTicketSaleIds(saleIds),
      this.ticketSaleItemGateway.deleteByTicketSaleIds(saleIds),
    ]);

    const deletedSales = await this.ticketSaleGateway.deleteMany(saleIds);

    this.logger.log(
      `Limpeza concluída: ${deletedSales} TicketSales, ${deletedPayments} pagamentos e ${deletedItems} itens removidos`,
    );

    return {
      cutoffDate,
      foundSales: saleIds.length,
      deletedSales,
      deletedPayments,
      deletedItems,
    };
  }
}
