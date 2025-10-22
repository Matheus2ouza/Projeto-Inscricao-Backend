export type ReportGeneralResponse = {
  event: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    amountCollected: number;
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
