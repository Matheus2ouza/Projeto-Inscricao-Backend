export type RelatorioGeralRequest = {
  eventId: string;
};

export type RelatorioGeralResponse = {
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
