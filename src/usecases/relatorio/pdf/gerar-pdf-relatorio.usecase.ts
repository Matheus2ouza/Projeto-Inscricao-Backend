import { Injectable } from '@nestjs/common';
import { RelatorioGeralUsecase } from '../geral/relatorio-geral.usecase';

export type GerarPdfRelatorioInput = {
  eventId: string;
};

export type GerarPdfRelatorioOutput = {
  pdfBuffer: Buffer;
  filename: string;
};

@Injectable()
export class GerarPdfRelatorioUsecase {
  public constructor(
    private readonly relatorioGeralUsecase: RelatorioGeralUsecase,
  ) {}

  public async execute({
    eventId,
  }: GerarPdfRelatorioInput): Promise<GerarPdfRelatorioOutput> {
    // Buscar dados do relatório
    const relatorioData = await this.relatorioGeralUsecase.execute({ eventId });

    // Gerar PDF
    const pdfBuffer = await this.gerarPdf(relatorioData);
    const filename = `relatorio-${relatorioData.event.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      pdfBuffer,
      filename,
    };
  }

  private async gerarPdf(relatorioData: any): Promise<Buffer> {
    // Por enquanto, vamos retornar um buffer vazio
    // Você pode implementar a geração de PDF usando uma biblioteca como puppeteer, jsPDF, etc.
    const pdfContent = this.gerarConteudoPdf(relatorioData);

    // Simulação de geração de PDF - substitua por uma implementação real
    return Buffer.from(pdfContent, 'utf-8');
  }

  private gerarConteudoPdf(relatorioData: any): string {
    const { event, totais, inscricoes, inscricoesAvulsas, tickets, gastos } =
      relatorioData;

    return `
RELATÓRIO GERAL DO EVENTO
========================

Evento: ${event.name}
Data de Início: ${new Date(event.startDate).toLocaleDateString('pt-BR')}
Data de Fim: ${new Date(event.endDate).toLocaleDateString('pt-BR')}
Local: ${event.location || 'Não informado'}

TOTAIS GERAIS
=============
Total Geral: R$ ${totais.totalGeral.toFixed(2)}
Total Dinheiro: R$ ${totais.totalDinheiro.toFixed(2)}
Total PIX: R$ ${totais.totalPix.toFixed(2)}
Total Cartão: R$ ${totais.totalCartao.toFixed(2)}

INSCRIÇÕES
==========
Total: R$ ${inscricoes.total.toFixed(2)}
Dinheiro: R$ ${inscricoes.totalDinheiro.toFixed(2)}
PIX: R$ ${inscricoes.totalPix.toFixed(2)}
Cartão: R$ ${inscricoes.totalCartao.toFixed(2)}

Quantidade de Inscrições: ${inscricoes.inscricoes.length}

INSCRIÇÕES AVULSAS
==================
Total: R$ ${inscricoesAvulsas.total.toFixed(2)}
Dinheiro: R$ ${inscricoesAvulsas.totalDinheiro.toFixed(2)}
PIX: R$ ${inscricoesAvulsas.totalPix.toFixed(2)}
Cartão: R$ ${inscricoesAvulsas.totalCartao.toFixed(2)}

Quantidade de Inscrições Avulsas: ${inscricoesAvulsas.inscricoes.length}

TICKETS
=======
Total: R$ ${tickets.total.toFixed(2)}
Dinheiro: R$ ${tickets.totalDinheiro.toFixed(2)}
PIX: R$ ${tickets.totalPix.toFixed(2)}
Cartão: R$ ${tickets.totalCartao.toFixed(2)}

Quantidade de Vendas: ${tickets.vendas.length}

GASTOS
======
Total: R$ ${gastos.total.toFixed(2)}
Dinheiro: R$ ${gastos.totalDinheiro.toFixed(2)}
PIX: R$ ${gastos.totalPix.toFixed(2)}
Cartão: R$ ${gastos.totalCartao.toFixed(2)}

Quantidade de Gastos: ${gastos.gastos.length}

DETALHES DAS INSCRIÇÕES
=======================
${inscricoes.inscricoes
  .map(
    (inscricao) => `
ID: ${inscricao.id}
Responsável: ${inscricao.responsible}
Telefone: ${inscricao.phone}
Valor: R$ ${inscricao.totalValue.toFixed(2)}
Status: ${inscricao.status}
Data: ${new Date(inscricao.createdAt).toLocaleDateString('pt-BR')}
`,
  )
  .join('')}

DETALHES DAS INSCRIÇÕES AVULSAS
===============================
${inscricoesAvulsas.inscricoes
  .map(
    (inscricao) => `
ID: ${inscricao.id}
Responsável: ${inscricao.responsible}
Telefone: ${inscricao.phone || 'Não informado'}
Valor: R$ ${inscricao.totalValue.toFixed(2)}
Status: ${inscricao.status}
Data: ${new Date(inscricao.createdAt).toLocaleDateString('pt-BR')}
`,
  )
  .join('')}

DETALHES DAS VENDAS DE TICKETS
==============================
${tickets.vendas
  .map(
    (venda) => `
ID: ${venda.id}
Quantidade: ${venda.quantity}
Valor Total: R$ ${venda.totalValue.toFixed(2)}
Método de Pagamento: ${venda.paymentMethod}
Data: ${new Date(venda.createdAt).toLocaleDateString('pt-BR')}
`,
  )
  .join('')}

DETALHES DOS GASTOS
===================
${gastos.gastos
  .map(
    (gasto) => `
ID: ${gasto.id}
Descrição: ${gasto.description}
Valor: R$ ${gasto.value.toFixed(2)}
Método de Pagamento: ${gasto.paymentMethod}
Responsável: ${gasto.responsible}
Data: ${new Date(gasto.createdAt).toLocaleDateString('pt-BR')}
`,
  )
  .join('')}

Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
    `.trim();
  }
}
