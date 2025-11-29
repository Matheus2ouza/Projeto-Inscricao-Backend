import { UsecaseException } from '../usecase.exception';

export class TicketSaleNotFoundPrismaRepositoryException extends UsecaseException {
  public constructor(internalMessage: string, context: string) {
    super(
      internalMessage,
      'Venda de ticket não encontrada ao acessar o banco de dados.',
      context,
    );
    this.name = 'TicketSaleNotFoundPrismaRepositoryException';
  }
}
