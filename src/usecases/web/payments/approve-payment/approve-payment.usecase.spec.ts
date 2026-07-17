import { InscriptionStatus, StatusPayment } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';
import {
  ApprovePaymentInput,
  ApprovePaymentUsecase,
} from './approve-payment.usecase';

describe(ApprovePaymentUsecase.name, () => {
  let usecase: ApprovePaymentUsecase;
  let paymentGateway: jest.Mocked<{
    findById: jest.Mock;
    updateTx: jest.Mock;
  }>;
  let eventGateway: jest.Mocked<{
    findById: jest.Mock;
    updateTx: jest.Mock;
  }>;
  let financialMovementGateway: jest.Mocked<{ createTx: jest.Mock }>;
  let paymentAllocationGateway: jest.Mocked<{ findByPaymentId: jest.Mock }>;
  let paymentInstallmentGateway: jest.Mocked<{ createTx: jest.Mock }>;
  let inscriptionGateway: jest.Mocked<{
    findById: jest.Mock;
    updateManyTx: jest.Mock;
    countParticipants: jest.Mock;
  }>;
  let accountGateway: jest.Mocked<{ findById: jest.Mock }>;
  let cashRegisterEventGateway: jest.Mocked<{ findByEventId: jest.Mock }>;
  let cashRegisterEntryGateway: jest.Mocked<{ createManyTx: jest.Mock }>;
  let cashRegisterGateway: jest.Mocked<{
    findById: jest.Mock;
    update: jest.Mock;
    updateManyTx: jest.Mock;
  }>;
  let paymentApprovedEmailHandler: jest.Mocked<{
    sendPaymentApprovedEmail: jest.Mock;
  }>;
  let prisma: { runInTransaction: jest.Mock };

  const defaultInput: ApprovePaymentInput = {
    paymentId: 'payment-id-1',
    accountId: 'account-id-1',
  };

  const makePayment = ({
    id = 'payment-id-1',
    eventId = 'event-id-1',
    accountId = 'account-id-1',
    totalValue = 200,
    totalPaid = 200,
    status = StatusPayment.PENDING,
    isGuest = false,
    guestName = '',
    guestEmail = '',
    imageUrls = ['image-url-1', 'image-url-2', 'image-url-3'],
  }: Partial<{
    id: string;
    eventId: string;
    accountId: string;
    totalValue: number;
    totalPaid: number;
    status: StatusPayment;
    isGuest: boolean;
    guestName: string;
    guestEmail: string;
    imageUrls: string[];
  }> = {}) => {
    let currentStatus = status;
    return {
      getId: jest.fn(() => id),
      getEventId: jest.fn(() => eventId),
      getAccountId: jest.fn(() => accountId),
      getTotalValue: jest.fn(() => totalValue),
      getTotalPaid: jest.fn(() => totalPaid),
      getTotalNetValue: jest.fn(() => totalValue),
      getStatus: jest.fn(() => currentStatus),
      getIsGuest: jest.fn(() => isGuest),
      getGuestName: jest.fn(() => guestName),
      getGuestEmail: jest.fn(() => guestEmail),
      getImageUrls: jest.fn(() => imageUrls),
      getInstallments: jest.fn(() => 1),
      approve: jest.fn((approvedBy: string) => {
        currentStatus = StatusPayment.APPROVED;
      }),
      isFullyPaid: jest.fn(() => totalPaid >= totalValue),
      addPaidInstallment: jest.fn(),
      setTotalReceived: jest.fn(),
    } as any;
  };

  const makeEvent = (id = 'event-id-1') =>
    ({
      getId: jest.fn(() => id),
      getName: jest.fn(() => 'Evento Teste'),
      addCollectedAmount: jest.fn(),
      addNetValueCollected: jest.fn(),
      addParticipants: jest.fn(),
      addParticipant: jest.fn(),
      incrementAmountCollected: jest.fn(),
      incrementAmountNetValueCollected: jest.fn(),
      incrementParticipantsCount: jest.fn(),
      incrementQuantityParticipants: jest.fn(),
    }) as any;

  const makeAllocation = (inscriptionId: string, value: number) =>
    ({
      getInscriptionId: jest.fn(() => inscriptionId),
      getValue: jest.fn(() => value),
    }) as any;

  const makeInscription = ({
    id = 'insc-id-1',
    totalValue = 100,
    totalPaid = 100,
    status = InscriptionStatus.PENDING,
    responsible = 'Responsável',
    email = 'resp@email.com',
  }: Partial<{
    id: string;
    totalValue: number;
    totalPaid: number;
    status: InscriptionStatus;
    responsible: string;
    email: string;
  }> = {}) => {
    let currentStatus = status;
    return {
      getId: jest.fn(() => id),
      getTotalValue: jest.fn(() => totalValue),
      getTotalPaid: jest.fn(() => totalPaid),
      getStatus: jest.fn(() => currentStatus),
      getResponsible: jest.fn(() => responsible),
      getEmail: jest.fn(() => email),
      inscriptionPaid: jest.fn(() => {
        currentStatus = InscriptionStatus.PAID;
      }),
    } as any;
  };

  const makeCashRegisterEvent = (cashRegisterId: string) =>
    ({
      getCashRegisterId: jest.fn(() => cashRegisterId),
    }) as any;

  const makeCashRegister = (id: string, balance = 0) =>
    ({
      getId: jest.fn(() => id),
      incrementBalance: jest.fn(),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    paymentGateway = {
      findById: jest.fn(),
      updateTx: jest.fn(),
    };
    eventGateway = {
      findById: jest.fn(),
      updateTx: jest.fn(),
    };
    financialMovementGateway = { createTx: jest.fn() };
    paymentAllocationGateway = { findByPaymentId: jest.fn() };
    paymentInstallmentGateway = { createTx: jest.fn() };
    inscriptionGateway = {
      findById: jest.fn(),
      updateManyTx: jest.fn(),
      countParticipants: jest.fn(),
    };
    accountGateway = { findById: jest.fn() };
    cashRegisterEventGateway = { findByEventId: jest.fn() };
    cashRegisterEntryGateway = { createManyTx: jest.fn() };
    cashRegisterGateway = {
      findById: jest.fn(),
      update: jest.fn(),
      updateManyTx: jest.fn(),
    };
    paymentApprovedEmailHandler = { sendPaymentApprovedEmail: jest.fn() };
    prisma = { runInTransaction: jest.fn((fn) => fn({} as any)) };

    // Spies para entidades
    jest.spyOn(FinancialMovement, 'create').mockReturnValue({
      getId: jest.fn(() => 'fm-id-1'),
      getEventId: jest.fn(() => 'event-id-1'),
      getAccountId: jest.fn(() => 'account-id-1'),
      getValue: jest.fn(() => new Decimal(200)),
    } as any);

    jest.spyOn(PaymentInstallment, 'create').mockReturnValue({
      getId: jest.fn(() => 'installment-id-1'),
      getValue: jest.fn(() => 200),
      getNetValue: jest.fn(() => 200),
      getInstallmentNumber: jest.fn(() => 1),
    } as any);

    jest.spyOn(CashRegisterEntry, 'create').mockImplementation(
      (props) =>
        ({
          getCashRegisterId: jest.fn(() => props.cashRegisterId),
          getValue: jest.fn(() => props.value),
          getType: jest.fn(() => props.type),
          getOrigin: jest.fn(() => props.origin),
          getMethod: jest.fn(() => props.method),
          getDescription: jest.fn(() => props.description),
          getEventId: jest.fn(() => props.eventId),
          getPaymentInstallmentId: jest.fn(() => props.paymentInstallmentId),
          getResponsible: jest.fn(() => props.responsible),
          getImageUrls: jest.fn(() => props.imageUrls),
        }) as any,
    );

    usecase = new ApprovePaymentUsecase(
      eventGateway as any,
      paymentGateway as any,
      financialMovementGateway as any,
      paymentAllocationGateway as any,
      paymentInstallmentGateway as any,
      inscriptionGateway as any,
      accountGateway as any,
      cashRegisterEventGateway as any,
      cashRegisterEntryGateway as any,
      cashRegisterGateway as any,
      paymentApprovedEmailHandler as any,
      prisma as any,
    );
  });

  it('deve aprovar pagamento com sucesso e liberar inscrições', async () => {
    // arrange
    const payment = makePayment({ totalValue: 200, totalPaid: 200 });
    paymentGateway.findById.mockResolvedValue(payment);

    const event = makeEvent();
    eventGateway.findById.mockResolvedValue(event);

    const allocations = [
      makeAllocation('insc-id-1', 100),
      makeAllocation('insc-id-2', 100),
    ];
    paymentAllocationGateway.findByPaymentId.mockResolvedValue(allocations);

    const inscription1 = makeInscription({
      id: 'insc-id-1',
      totalValue: 100,
      totalPaid: 100,
    });
    const inscription2 = makeInscription({
      id: 'insc-id-2',
      totalValue: 100,
      totalPaid: 100,
    });
    inscriptionGateway.findById.mockImplementation((id: string) => {
      if (id === 'insc-id-1') return Promise.resolve(inscription1);
      if (id === 'insc-id-2') return Promise.resolve(inscription2);
      return Promise.resolve(null);
    });
    inscriptionGateway.countParticipants.mockResolvedValue(2);

    // Mock dos caixas do evento
    const cashRegisterEvents = [
      makeCashRegisterEvent('cash-register-id-1'),
      makeCashRegisterEvent('cash-register-id-2'),
    ];
    cashRegisterEventGateway.findByEventId.mockResolvedValue(
      cashRegisterEvents,
    );

    const cashRegister1 = makeCashRegister('cash-register-id-1', 1000);
    const cashRegister2 = makeCashRegister('cash-register-id-2', 500);
    cashRegisterGateway.findById.mockImplementation((id: string) => {
      if (id === 'cash-register-id-1') return Promise.resolve(cashRegister1);
      if (id === 'cash-register-id-2') return Promise.resolve(cashRegister2);
      return Promise.resolve(null);
    });

    // act
    const output = await usecase.execute(defaultInput);

    // assert
    expect(output.id).toBe('payment-id-1');
    expect(output.status).toBe(StatusPayment.APPROVED);
    expect(payment.approve).toHaveBeenCalledWith('account-id-1');

    // Verificações financeiras
    expect(financialMovementGateway.createTx).toHaveBeenCalledTimes(1);
    expect(paymentInstallmentGateway.createTx).toHaveBeenCalledTimes(1);

    // Verificações do evento
    expect(event.addCollectedAmount).toHaveBeenCalledWith(200);
    expect(event.addNetValueCollected).toHaveBeenCalledWith(200);
    expect(event.addParticipants).toHaveBeenCalledWith(4); // 2 inscrições x 2 participantes

    // Verificações das inscrições
    expect(inscription1.inscriptionPaid).toHaveBeenCalled();
    expect(inscription2.inscriptionPaid).toHaveBeenCalled();
    expect(inscriptionGateway.updateManyTx).toHaveBeenCalledTimes(1);

    // Verificações do caixa
    expect(cashRegisterEntryGateway.createManyTx).toHaveBeenCalledTimes(1);
    const createdEntries =
      cashRegisterEntryGateway.createManyTx.mock.calls[0][0];
    expect(createdEntries).toHaveLength(2);
    expect(createdEntries[0].getValue()).toBe(200);
    expect(createdEntries[1].getValue()).toBe(200);

    expect(cashRegisterGateway.findById).toHaveBeenCalledTimes(2);
    expect(cashRegister1.incrementBalance).toHaveBeenCalledWith(200);
    expect(cashRegister2.incrementBalance).toHaveBeenCalledWith(200);

    // CORREÇÃO: Verificar que updateManyTx foi chamado com os caixas atualizados
    expect(cashRegisterGateway.updateManyTx).toHaveBeenCalledTimes(1);
    expect(cashRegisterGateway.updateManyTx).toHaveBeenCalledWith(
      [cashRegister1, cashRegister2],
      expect.anything(),
    );

    // Verificações da transação
    expect(prisma.runInTransaction).toHaveBeenCalledTimes(1);
    expect(paymentGateway.updateTx).toHaveBeenCalledWith(
      payment,
      expect.anything(),
    );
    expect(eventGateway.updateTx).toHaveBeenCalledWith(
      event,
      expect.anything(),
    );

    // Verificações de email
    expect(
      paymentApprovedEmailHandler.sendPaymentApprovedEmail,
    ).toHaveBeenCalledTimes(2);
  });

  it('deve aprovar pagamento com sucesso mesmo quando não há caixas configurados para o evento', async () => {
    // arrange
    const payment = makePayment({ totalValue: 200, totalPaid: 200 });
    paymentGateway.findById.mockResolvedValue(payment);

    const event = makeEvent();
    eventGateway.findById.mockResolvedValue(event);

    const allocations = [
      makeAllocation('insc-id-1', 100),
      makeAllocation('insc-id-2', 100),
    ];
    paymentAllocationGateway.findByPaymentId.mockResolvedValue(allocations);

    const inscription1 = makeInscription({
      id: 'insc-id-1',
      totalValue: 100,
      totalPaid: 100,
    });
    const inscription2 = makeInscription({
      id: 'insc-id-2',
      totalValue: 100,
      totalPaid: 100,
    });
    inscriptionGateway.findById.mockImplementation((id: string) => {
      if (id === 'insc-id-1') return Promise.resolve(inscription1);
      if (id === 'insc-id-2') return Promise.resolve(inscription2);
      return Promise.resolve(null);
    });
    inscriptionGateway.countParticipants.mockResolvedValue(2);

    // Sem caixas configurados para o evento
    cashRegisterEventGateway.findByEventId.mockResolvedValue([]);

    // act
    const output = await usecase.execute(defaultInput);

    // assert
    expect(output.id).toBe('payment-id-1');
    expect(output.status).toBe(StatusPayment.APPROVED);

    // Não deve chamar gateways de caixa
    expect(cashRegisterEntryGateway.createManyTx).not.toHaveBeenCalled();
    expect(cashRegisterGateway.findById).not.toHaveBeenCalled();
    expect(cashRegisterGateway.updateManyTx).not.toHaveBeenCalled();

    // Demais verificações
    expect(event.addCollectedAmount).toHaveBeenCalledWith(200);
    expect(event.addNetValueCollected).toHaveBeenCalledWith(200);
    expect(event.addParticipants).toHaveBeenCalledWith(4);
    expect(financialMovementGateway.createTx).toHaveBeenCalledTimes(1);
    expect(paymentInstallmentGateway.createTx).toHaveBeenCalledTimes(1);
    expect(inscriptionGateway.updateManyTx).toHaveBeenCalledTimes(1);
    expect(prisma.runInTransaction).toHaveBeenCalledTimes(1);
  });

  it('deve lançar PaymentNotFoundUsecaseException quando pagamento não existe', async () => {
    // arrange
    paymentGateway.findById.mockResolvedValue(null);

    // act
    const act = () => usecase.execute(defaultInput);

    // assert
    await expect(act()).rejects.toBeInstanceOf(PaymentNotFoundUsecaseException);
    expect(eventGateway.findById).not.toHaveBeenCalled();
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar EventNotFoundUsecaseException quando evento não existe', async () => {
    // arrange
    const payment = makePayment();
    paymentGateway.findById.mockResolvedValue(payment);
    eventGateway.findById.mockResolvedValue(null);

    // act
    const act = () => usecase.execute(defaultInput);

    // assert
    await expect(act()).rejects.toBeInstanceOf(EventNotFoundUsecaseException);
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('não deve aprovar nem liberar inscrições quando pagamento não está totalmente pago', async () => {
    const payment = makePayment({ totalValue: 200, totalPaid: 150 });
    paymentGateway.findById.mockResolvedValue(payment);

    const event = makeEvent();
    eventGateway.findById.mockResolvedValue(event);

    const allocations = [makeAllocation('insc-id-1', 150)];
    paymentAllocationGateway.findByPaymentId.mockResolvedValue(allocations);

    cashRegisterEventGateway.findByEventId.mockResolvedValue([]);

    accountGateway.findById.mockResolvedValue({
      getUsername: jest.fn(() => 'Usuário Teste'),
      getEmail: jest.fn(() => 'teste@email.com'),
    } as any);

    // act
    const output = await usecase.execute(defaultInput);

    // assert
    expect(output.status).toBe(StatusPayment.PENDING);
    expect(payment.approve).not.toHaveBeenCalled();
    expect(event.addParticipants).not.toHaveBeenCalled();
    expect(inscriptionGateway.findById).not.toHaveBeenCalled();
    expect(inscriptionGateway.updateManyTx).not.toHaveBeenCalled();
    expect(
      paymentApprovedEmailHandler.sendPaymentApprovedEmail,
    ).toHaveBeenCalledTimes(1);
  });
});
