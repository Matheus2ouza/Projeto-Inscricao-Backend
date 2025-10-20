import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'generated/prisma';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { EventNotFoundUsecaseException } from 'src/usecases/exceptions/events/event-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type RelatorioGeralInput = {
  eventId: string;
};

export type RelatorioGeralOutput = {
  event: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    location: string | null;
    amountCollected: number;
  };
  totais: {
    totalGeral: number;
    totalDinheiro: number;
    totalPix: number;
    totalCartao: number;
  };
  inscricoes: {
    total: number;
    totalDinheiro: number;
    totalPix: number;
    totalCartao: number;
    inscricoes: Array<{
      id: string;
      responsible: string;
      phone: string | null;
      totalValue: number;
      status: string;
      createdAt: Date;
    }>;
  };
  inscricoesAvulsas: {
    total: number;
    totalDinheiro: number;
    totalPix: number;
    totalCartao: number;
    inscricoes: Array<{
      id: string;
      responsible: string;
      phone: string | null;
      totalValue: number;
      status: string;
      createdAt: Date;
    }>;
  };
  tickets: {
    total: number;
    totalDinheiro: number;
    totalPix: number;
    totalCartao: number;
    vendas: Array<{
      id: string;
      quantity: number;
      totalValue: number;
      paymentMethod: string;
      createdAt: Date;
    }>;
  };
  gastos: {
    total: number;
    totalDinheiro: number;
    totalPix: number;
    totalCartao: number;
    gastos: Array<{
      id: string;
      description: string;
      value: number;
      paymentMethod: string;
      responsible: string;
      createdAt: Date;
    }>;
  };
};

@Injectable()
export class RelatorioGeralUsecase
  implements Usecase<RelatorioGeralInput, RelatorioGeralOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
  ) {}

  public async execute({
    eventId,
  }: RelatorioGeralInput): Promise<RelatorioGeralOutput> {
    // Verificar se o evento existe
    const event = await this.eventGateway.findById(eventId);
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id: ${eventId}`,
        `Evento não encontrado`,
        RelatorioGeralUsecase.name,
      );
    }

    // Buscar dados das inscrições
    const inscricoes = await this.inscriptionGateway.findManyPaginatedByEvent(
      eventId,
      1,
      1000, // Buscar todas as inscrições
    );

    // Buscar dados das inscrições avulsas
    const inscricoesAvulsas =
      await this.onSiteRegistrationGateway.findManyPaginated(1, 1000, eventId);

    // Buscar dados dos tickets
    const tickets = await this.ticketSaleGateway.findByEventId(eventId);

    // Buscar dados dos gastos
    const gastos = await this.eventExpensesGateway.findManyPaginated(
      1,
      1000,
      eventId,
    );

    // Calcular totais das inscrições
    const inscricoesTotais = this.calcularTotaisInscricoes(inscricoes);

    // Calcular totais das inscrições avulsas
    const inscricoesAvulsasTotais =
      await this.onSiteRegistrationGateway.sumPaymentsByMethod(eventId);

    // Calcular totais dos tickets
    const ticketsTotais = this.calcularTotaisTickets(tickets);

    // Calcular totais dos gastos
    const gastosTotais = this.calcularTotaisGastos(gastos);

    // Calcular totais gerais
    const totais = {
      totalGeral:
        inscricoesTotais.total +
        inscricoesAvulsasTotais.totalGeral +
        ticketsTotais.total -
        gastosTotais.total,
      totalDinheiro:
        inscricoesTotais.totalDinheiro +
        inscricoesAvulsasTotais.totalDinheiro +
        ticketsTotais.totalDinheiro -
        gastosTotais.totalDinheiro,
      totalPix:
        inscricoesTotais.totalPix +
        inscricoesAvulsasTotais.totalPix +
        ticketsTotais.totalPix -
        gastosTotais.totalPix,
      totalCartao:
        inscricoesTotais.totalCartao +
        inscricoesAvulsasTotais.totalCartao +
        ticketsTotais.totalCartao -
        gastosTotais.totalCartao,
    };

    return {
      event: {
        id: event.getId(),
        name: event.getName(),
        startDate: event.getStartDate(),
        endDate: event.getEndDate(),
        location: event.getLocation() || null,
        amountCollected: event.getAmountCollected(),
      },
      totais,
      inscricoes: {
        ...inscricoesTotais,
        inscricoes: inscricoes.map((inscricao) => ({
          id: inscricao.getId(),
          responsible: inscricao.getResponsible(),
          phone: inscricao.getPhone() || null,
          totalValue: Number(inscricao.getTotalValue()),
          status: String(inscricao.getStatus()),
          createdAt: inscricao.getCreatedAt(),
        })),
      },
      inscricoesAvulsas: {
        total: inscricoesAvulsasTotais.totalGeral,
        totalDinheiro: inscricoesAvulsasTotais.totalDinheiro,
        totalPix: inscricoesAvulsasTotais.totalPix,
        totalCartao: inscricoesAvulsasTotais.totalCartao,
        inscricoes: inscricoesAvulsas.map((inscricao) => ({
          id: inscricao.getId(),
          responsible: inscricao.getResponsible(),
          phone: inscricao.getPhone() || null,
          totalValue: Number(inscricao.getTotalValue()),
          status: String(inscricao.getStatus()),
          createdAt: inscricao.getCreatedAt(),
        })),
      },
      tickets: {
        ...ticketsTotais,
        vendas: tickets.map((ticket) => ({
          id: ticket.getId(),
          quantity: ticket.getQuantity(),
          totalValue: Number(ticket.getTotalValue()),
          paymentMethod: String(ticket.getPaymentMethod()),
          createdAt: ticket.getCreatedAt(),
        })),
      },
      gastos: {
        ...gastosTotais,
        gastos: gastos.map((gasto) => ({
          id: gasto.getId(),
          description: gasto.getDescription(),
          value: Number(gasto.getValue()),
          paymentMethod: String(gasto.getPaymentMethod()),
          responsible: gasto.getResponsible(),
          createdAt: gasto.getCreatedAt(),
        })),
      },
    };
  }

  private calcularTotaisInscricoes(inscricoes: any[]) {
    const totais = {
      total: 0,
      totalDinheiro: 0,
      totalPix: 0,
      totalCartao: 0,
    };

    inscricoes.forEach((inscricao) => {
      const valor = inscricao.getTotalValue();
      totais.total += valor;

      // Para inscrições, assumimos que são pagas via PIX por padrão
      // Você pode ajustar isso conforme sua lógica de negócio
      totais.totalPix += valor;
    });

    return totais;
  }

  private calcularTotaisTickets(tickets: any[]) {
    const totais = {
      total: 0,
      totalDinheiro: 0,
      totalPix: 0,
      totalCartao: 0,
    };

    tickets.forEach((ticket) => {
      const valor = ticket.getTotalValue();
      totais.total += valor;

      switch (ticket.getPaymentMethod()) {
        case PaymentMethod.DINHEIRO:
          totais.totalDinheiro += valor;
          break;
        case PaymentMethod.PIX:
          totais.totalPix += valor;
          break;
        case PaymentMethod.CARTÃO:
          totais.totalCartao += valor;
          break;
      }
    });

    return totais;
  }

  private calcularTotaisGastos(gastos: any[]) {
    const totais = {
      total: 0,
      totalDinheiro: 0,
      totalPix: 0,
      totalCartao: 0,
    };

    gastos.forEach((gasto) => {
      const valor = gasto.getValue();
      totais.total += valor;

      switch (gasto.getPaymentMethod()) {
        case PaymentMethod.DINHEIRO:
          totais.totalDinheiro += valor;
          break;
        case PaymentMethod.PIX:
          totais.totalPix += valor;
          break;
        case PaymentMethod.CARTÃO:
          totais.totalCartao += valor;
          break;
      }
    });

    return totais;
  }
}
