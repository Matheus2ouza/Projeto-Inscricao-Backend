import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'generated/prisma';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { EventNotFoundUsecaseException } from 'src/usecases/exceptions/events/event-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type ReportGeneralInput = {
  eventId: string;
};

export type ReportGeneralOutput = {
  event: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    location: string | null;
    amountCollected: number;
    imageUrl: string | null;
  };
  totais: {
    totalGeral: number;
    totalArrecadado: number;
    totalDinheiro: number;
    totalPix: number;
    totalCartao: number;
    totalGastos: number;
    totalInscricoesGrupo: number;
    totalParticipantesGrupo: number;
    totalInscricoesAvulsas: number;
    totalParticipantesAvulsos: number;
    totalParticipantes: number;
  };
  inscricoes: {
    total: number;
    totalDinheiro: number;
    totalPix: number;
    totalCartao: number;
    totalParticipantes: number;
    inscricoes: Array<{
      id: string;
      responsible: string;
      countParticipants: number;
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
    totalParticipantes: number;
    inscricoes: Array<{
      id: string;
      responsible: string;
      countParticipants: number;
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
      name: string;
      quantitySold: number;
      totalValue: number;
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
export class ReportGeneralUsecase
  implements Usecase<ReportGeneralInput, ReportGeneralOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
    private readonly onSiteParticipantGateway: OnSiteParticipantGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
  ) {}

  public async execute({
    eventId,
  }: ReportGeneralInput): Promise<ReportGeneralOutput> {
    // Verificar se o evento existe
    const event = await this.eventGateway.findById(eventId);
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id: ${eventId}`,
        `Evento não encontrado`,
        ReportGeneralUsecase.name,
      );
    }

    // Buscar dados das inscrições
    const inscricoes = await this.inscriptionGateway.findMany(eventId);

    // Buscar dados das inscrições avulsas
    const inscricoesAvulsas =
      await this.onSiteRegistrationGateway.findMany(eventId);

    // Buscar dados dos tickets
    const tickets = await this.ticketSaleGateway.findByEventId(eventId);

    // Buscar dados dos event tickets
    const eventTickets = await this.eventTicketsGateway.findAll(eventId);

    // Buscar dados dos gastos
    const gastos = await this.eventExpensesGateway.findMany(eventId);

    // Calcular totais das inscrições
    const inscricoesTotais = await this.calcularTotaisInscricoes(inscricoes);

    // Calcular totais das inscrições avulsas
    const inscricoesAvulsasTotais =
      await this.onSiteRegistrationGateway.sumPaymentsByMethod(eventId);

    // Calcular totais dos tickets
    const ticketsTotais = this.calcularTotaisTickets(tickets);

    // Calcular totais dos gastos
    const gastosTotais = this.calcularTotaisGastos(gastos);

    const totalInscricoesGrupo = inscricoes.length;
    const totalParticipantesGrupo = inscricoesTotais.totalParticipantes;
    const totalInscricoesAvulsas = inscricoesAvulsas.length;
    const totalParticipantesAvulsos =
      await this.calcularTotalParticipantesAvulsas(inscricoesAvulsas);

    // Calcular totais gerais
    const totais = {
      totalGeral:
        inscricoesTotais.total +
        inscricoesAvulsasTotais.totalGeral +
        ticketsTotais.total,
      totalArrecadado:
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
      totalGastos: gastosTotais.total,
      totalInscricoesGrupo,
      totalParticipantesGrupo,
      totalInscricoesAvulsas,
      totalParticipantesAvulsos,
      totalParticipantes: totalParticipantesGrupo + totalParticipantesAvulsos,
    };

    return {
      event: {
        id: event.getId(),
        name: event.getName(),
        startDate: event.getStartDate(),
        endDate: event.getEndDate(),
        location: event.getLocation() || null,
        amountCollected: event.getAmountCollected(),
        imageUrl: event.getImageUrl() || null,
      },
      totais,
      inscricoes: {
        ...inscricoesTotais,
        inscricoes: await Promise.all(
          inscricoes.map(async (inscricao) => {
            const [countParticipants, pagamentos] = await Promise.all([
              this.participantGateway.countByInscriptionId(inscricao.getId()),
              this.paymentInscriptionGateway.findbyInscriptionId(
                inscricao.getId(),
              ),
            ]);
            const totalPago =
              pagamentos?.reduce((total, pagamento) => {
                return total + pagamento.getValue().toNumber();
              }, 0) ?? 0;
            return {
              id: inscricao.getId(),
              responsible: inscricao.getResponsible(),
              countParticipants,
              totalValue: totalPago,
              status: String(inscricao.getStatus()),
              createdAt: inscricao.getCreatedAt(),
            };
          }),
        ),
      },
      inscricoesAvulsas: {
        total: inscricoesAvulsasTotais.totalGeral,
        totalDinheiro: inscricoesAvulsasTotais.totalDinheiro,
        totalPix: inscricoesAvulsasTotais.totalPix,
        totalCartao: inscricoesAvulsasTotais.totalCartao,
        totalParticipantes: totalParticipantesAvulsos,
        inscricoes: await Promise.all(
          inscricoesAvulsas.map(async (inscricao) => {
            const countParticipants =
              await this.onSiteParticipantGateway.countParticipantsByOnSiteRegistrationId(
                inscricao.getId(),
              );
            return {
              id: inscricao.getId(),
              responsible: inscricao.getResponsible(),
              countParticipants,
              totalValue: Number(inscricao.getTotalValue()),
              status: String(inscricao.getStatus()),
              createdAt: inscricao.getCreatedAt(),
            };
          }),
        ),
      },
      tickets: {
        ...ticketsTotais,
        vendas: await this.agruparVendasPorEventTicket(eventTickets, tickets),
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

  private async calcularTotaisInscricoes(inscricoes: any[]) {
    const totais = {
      total: 0,
      totalDinheiro: 0,
      totalPix: 0,
      totalCartao: 0,
      totalParticipantes: 0,
    };

    for (const inscricao of inscricoes) {
      const pagamentos =
        (await this.paymentInscriptionGateway.findbyInscriptionId(
          inscricao.getId(),
        )) ?? [];

      const valorPago = pagamentos.reduce((total, pagamento) => {
        return total + pagamento.getValue().toNumber();
      }, 0);

      totais.total += valorPago;

      // Inscrições em grupo são liquidadas via PIX
      totais.totalPix += valorPago;

      // Contar participantes da inscrição
      const countParticipants =
        await this.participantGateway.countByInscriptionId(inscricao.getId());
      totais.totalParticipantes += countParticipants;
    }

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

  private async calcularTotalParticipantesAvulsas(
    inscricoesAvulsas: any[],
  ): Promise<number> {
    let totalParticipantes = 0;

    for (const inscricao of inscricoesAvulsas) {
      const countParticipants =
        await this.onSiteParticipantGateway.countParticipantsByOnSiteRegistrationId(
          inscricao.getId(),
        );
      totalParticipantes += countParticipants;
    }

    return totalParticipantes;
  }

  private async agruparVendasPorEventTicket(
    eventTickets: any[],
    ticketSales: any[],
  ): Promise<
    Array<{
      id: string;
      name: string;
      quantitySold: number;
      totalValue: number;
      createdAt: Date;
    }>
  > {
    const vendasAgrupadas: Array<{
      id: string;
      name: string;
      quantitySold: number;
      totalValue: number;
      createdAt: Date;
    }> = [];

    for (const eventTicket of eventTickets) {
      // Filtrar vendas para este EventTicket
      const vendasDoTicket = ticketSales.filter(
        (sale) => sale.getTicketId() === eventTicket.getId(),
      );

      if (vendasDoTicket.length > 0) {
        // Calcular quantidade total vendida
        const quantitySold = vendasDoTicket.reduce(
          (total, sale) => total + sale.getQuantity(),
          0,
        );

        // Calcular valor total vendido
        const totalValue = vendasDoTicket.reduce(
          (total, sale) => total + Number(sale.getTotalValue()),
          0,
        );

        // Pegar a data de criação mais antiga (primeira venda)
        const createdAt = vendasDoTicket.reduce((oldest, sale) => {
          return sale.getCreatedAt() < oldest ? sale.getCreatedAt() : oldest;
        }, vendasDoTicket[0].getCreatedAt());

        vendasAgrupadas.push({
          id: eventTicket.getId(),
          name: eventTicket.getName(),
          quantitySold,
          totalValue,
          createdAt,
        });
      }
    }

    return vendasAgrupadas;
  }
}
