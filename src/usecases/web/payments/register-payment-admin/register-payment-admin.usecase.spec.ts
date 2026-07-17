import {
  InscriptionStatus,
  StatusPayment,
  TransactionType,
} from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { InvalidInscriptionIdUsecaseException } from '../../exceptions/payment-Inscription/invalid-inscription-id.usecase.exception ';
import { OverpaymentNotAllowedUsecaseException } from '../../exceptions/payment-Inscription/overpayment-not-allowed.usecase.exception';
import { PaymentAllocationExceededUsecaseException } from '../../exceptions/payment-Inscription/payment-allocation-exceeded.usecase.exception';
import {
  RegisterPaymentAdminInput,
  RegisterPaymentAdminUsecase,
} from './register-payment-admin.usecase';

describe(RegisterPaymentAdminUsecase.name, () => {
  let usecase: RegisterPaymentAdminUsecase;
  let paymentGateway: jest.Mocked<{ createTx: jest.Mock }>;
  let inscriptionGateway: jest.Mocked<{
    findManyByIds: jest.Mock;
    updateTx: jest.Mock;
    countParticipants: jest.Mock;
  }>;
  let paymentAllocationGateway: jest.Mocked<{ createTx: jest.Mock }>;
  let paymentInstallmentGateway: jest.Mocked<{ createTx: jest.Mock }>;
  let financialMovementGateway: jest.Mocked<{ createTx: jest.Mock }>;
  let cashRegisterEntryGateway: jest.Mocked<{ createManyTx: jest.Mock }>;
  let cashRegisterEventGateway: jest.Mocked<{ findByEventId: jest.Mock }>;
  let cashRegisterGateway: jest.Mocked<{
    findById: jest.Mock;
    updateTx: jest.Mock;
  }>;
  let eventGateway: jest.Mocked<{ findById: jest.Mock; updateTx: jest.Mock }>;
  let userGateway: jest.Mocked<{ findById: jest.Mock }>;
  let supabaseStorageService: jest.Mocked<{ uploadFile: jest.Mock }>;
  let imageOptimizerService: jest.Mocked<{
    processBase64Image: jest.Mock;
    validateImage: jest.Mock;
    optimizeImage: jest.Mock;
    getMimeType: jest.Mock;
  }>;
  let prisma: { runInTransaction: jest.Mock };

  const defaultInput: RegisterPaymentAdminInput = {
    userId: 'user-id-1',
    amount: 200.0,
    image: 'base64imagemock',
    isGuest: false,
    accountId: 'account-id-1',
    inscriptions: [
      { id: 'insc-id-1', amount: 100.0 },
      { id: 'insc-id-2', amount: 100.0 },
    ],
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

  const makeInscription = ({
    id,
    totalValue = 100,
    totalPaid = 0,
    status = InscriptionStatus.PENDING,
    isGuest = false,
    eventId = 'event-id-1',
  }: {
    id: string;
    totalValue?: number;
    totalPaid?: number;
    status?: InscriptionStatus;
    isGuest?: boolean;
    eventId?: string;
  }) => {
    let currentTotalPaid = totalPaid;
    let currentStatus = status;

    return {
      getId: jest.fn(() => id),
      getTotalValue: jest.fn(() => totalValue),
      getTotalPaid: jest.fn(() => currentTotalPaid),
      getStatus: jest.fn(() => currentStatus),
      getIsGuest: jest.fn(() => isGuest),
      getEventId: jest.fn(() => eventId),
      incrementeValuePaid: jest.fn((value: number) => {
        currentTotalPaid += value;
      }),
      inscriptionPaid: jest.fn(() => {
        currentStatus = InscriptionStatus.PAID;
      }),
    } as any;
  };

  const makeEvent = (id = 'event-id-1') =>
    ({
      getId: jest.fn(() => id),
      getName: jest.fn(() => 'Evento Teste'),
      addCollectedAmount: jest.fn(), // CORRIGIDO: era incrementAmountCollected
      addNetValueCollected: jest.fn(), // CORRIGIDO: era incrementAmountNetValueCollected
      addParticipant: jest.fn(), // CORRIGIDO: era incrementParticipantsCount
    }) as any;

  const makeCashRegisterEvent = (cashRegisterId: string) =>
    ({
      getCashRegisterId: jest.fn(() => cashRegisterId),
    }) as any;

  const makeCashRegister = (id: string, balance = 0) =>
    ({
      getId: jest.fn(() => id),
      incrementBalance: jest.fn(),
      decrementBalance: jest.fn(),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    paymentGateway = { createTx: jest.fn() };
    inscriptionGateway = {
      findManyByIds: jest.fn(),
      updateTx: jest.fn(),
      countParticipants: jest.fn(),
    };
    paymentAllocationGateway = { createTx: jest.fn() };
    paymentInstallmentGateway = { createTx: jest.fn() };
    financialMovementGateway = { createTx: jest.fn() };
    cashRegisterEntryGateway = { createManyTx: jest.fn() };
    cashRegisterEventGateway = { findByEventId: jest.fn() };
    cashRegisterGateway = { findById: jest.fn(), updateTx: jest.fn() };
    eventGateway = { findById: jest.fn(), updateTx: jest.fn() };
    userGateway = { findById: jest.fn() };
    supabaseStorageService = { uploadFile: jest.fn() };
    imageOptimizerService = {
      processBase64Image: jest.fn(),
      validateImage: jest.fn(),
      optimizeImage: jest.fn(),
      getMimeType: jest.fn(),
    };
    prisma = { runInTransaction: jest.fn((fn) => fn({} as any)) };

    // Mocks padrão para métodos estáticos de criação
    jest.spyOn(Payment, 'create').mockReturnValue({
      getId: jest.fn(() => 'payment-id-1'),
      getEventId: jest.fn(() => 'event-id-1'),
      getAccountId: jest.fn(() => 'account-id-1'),
      getStatus: jest.fn(() => StatusPayment.APPROVED),
      getTotalValue: jest.fn(() => 200),
      getTotalPaid: jest.fn(() => 200),
      getTotalNetValue: jest.fn(() => 200),
      getInstallments: jest.fn(() => 1),
      getImageUrls: jest.fn(() => ['image-url-1', 'image-url-2']),
      getIsGuest: jest.fn(() => false),
      addPaidInstallment: jest.fn(),
      setTotalReceived: jest.fn(),
    } as any);

    jest.spyOn(PaymentAllocation, 'create').mockImplementation(
      ({ paymentId, inscriptionId, value }) =>
        ({
          getId: jest.fn(() => `${paymentId}-${inscriptionId}`),
          getPaymentId: jest.fn(() => paymentId),
          getInscriptionId: jest.fn(() => inscriptionId),
          getValue: jest.fn(() => value),
        }) as any,
    );

    jest.spyOn(FinancialMovement, 'create').mockReturnValue({
      getId: jest.fn(() => 'fm-id-1'),
      getType: jest.fn(() => TransactionType.INCOME),
      getValue: jest.fn(() => new Decimal(200)),
    } as any);

    jest.spyOn(PaymentInstallment, 'create').mockReturnValue({
      getId: jest.fn(() => 'installment-id-1'),
      getValue: jest.fn(() => 200),
      getNetValue: jest.fn(() => 200),
      getInstallmentNumber: jest.fn(() => 1),
      getReceived: jest.fn(() => true),
    } as any);

    jest.spyOn(CashRegisterEntry, 'create').mockImplementation(
      (props) =>
        ({
          getCashRegisterId: jest.fn(() => props.cashRegisterId),
          getType: jest.fn(() => props.type),
          getValue: jest.fn(() => props.value),
        }) as any,
    );

    usecase = new RegisterPaymentAdminUsecase(
      paymentGateway as any,
      inscriptionGateway as any,
      paymentAllocationGateway as any,
      paymentInstallmentGateway as any,
      financialMovementGateway as any,
      cashRegisterEntryGateway as any,
      cashRegisterEventGateway as any,
      cashRegisterGateway as any,
      eventGateway as any,
      userGateway as any,
      supabaseStorageService as any,
      imageOptimizerService as any,
      prisma as any,
    );
  });

  it('deve registrar pagamento admin com sucesso', async () => {
    // arrange
    const inscription1 = makeInscription({
      id: 'insc-id-1',
      totalValue: 100,
      totalPaid: 0,
    });
    const inscription2 = makeInscription({
      id: 'insc-id-2',
      totalValue: 100,
      totalPaid: 0,
    });
    inscriptionGateway.findManyByIds.mockResolvedValue([
      inscription1,
      inscription2,
    ]);
    inscriptionGateway.countParticipants.mockResolvedValue(1);

    imageOptimizerService.processBase64Image.mockResolvedValue({
      buffer: Buffer.from('test'),
      extension: 'png',
    });
    imageOptimizerService.validateImage.mockResolvedValue(true);
    imageOptimizerService.optimizeImage.mockResolvedValue({
      buffer: Buffer.from('opt'),
      format: 'webp',
    });
    imageOptimizerService.getMimeType.mockReturnValue('image/webp');
    supabaseStorageService.uploadFile.mockResolvedValue(
      'https://supabase.url/image.webp',
    );

    const event = makeEvent();
    eventGateway.findById.mockResolvedValue(event);

    // Mock com caixa registrador para testar o fluxo completo
    const cashRegisterEvents = [
      makeCashRegisterEvent('cash-register-id-1'),
      makeCashRegisterEvent('cash-register-id-2'),
    ];
    cashRegisterEventGateway.findByEventId.mockResolvedValue(
      cashRegisterEvents,
    );

    const cashRegister1 = makeCashRegister('cash-register-id-1', 1000);
    const cashRegister2 = makeCashRegister('cash-register-id-2', 500);
    cashRegisterGateway.findById.mockResolvedValue(cashRegister1);
    cashRegisterGateway.findById.mockResolvedValueOnce(cashRegister1);
    cashRegisterGateway.findById.mockResolvedValueOnce(cashRegister2);

    // act
    const output = await usecase.execute(defaultInput);

    // assert
    // Verificações básicas
    expect(output.inscriptions).toHaveLength(2);
    expect(output.inscriptions[0].status).toBe(InscriptionStatus.PAID);
    expect(output.inscriptions[1].status).toBe(InscriptionStatus.PAID);

    // Verificações de busca
    expect(inscriptionGateway.findManyByIds).toHaveBeenCalledWith([
      'insc-id-1',
      'insc-id-2',
    ]);

    // Verificações da transação
    expect(prisma.runInTransaction).toHaveBeenCalledTimes(1);

    // Verificar criação do pagamento
    expect(paymentGateway.createTx).toHaveBeenCalledTimes(1);
    const createdPayment = paymentGateway.createTx.mock.calls[0][0];
    expect(createdPayment.getEventId()).toBe('event-id-1');
    expect(createdPayment.getTotalValue()).toBe(200);
    expect(createdPayment.getStatus()).toBe(StatusPayment.APPROVED);
    expect(createdPayment.getIsGuest()).toBe(false);

    // Verificar movimento financeiro
    expect(financialMovementGateway.createTx).toHaveBeenCalledTimes(1);
    const createdMovement = financialMovementGateway.createTx.mock.calls[0][0];
    expect(createdMovement.getType()).toBe(TransactionType.INCOME);
    expect(createdMovement.getValue().toNumber()).toBe(200);

    // Verificar parcela do pagamento
    expect(paymentInstallmentGateway.createTx).toHaveBeenCalledTimes(1);
    const createdInstallment =
      paymentInstallmentGateway.createTx.mock.calls[0][0];
    expect(createdInstallment.getValue()).toBe(200);
    expect(createdInstallment.getReceived()).toBe(true);

    // Verificar alocações
    expect(paymentAllocationGateway.createTx).toHaveBeenCalledTimes(2);
    const allocations = paymentAllocationGateway.createTx.mock.calls;
    expect(allocations[0][0].getValue()).toBe(100);
    expect(allocations[1][0].getValue()).toBe(100);

    // Verificar atualizações das inscrições
    expect(inscriptionGateway.updateTx).toHaveBeenCalledTimes(2);
    expect(inscription1.incrementeValuePaid).toHaveBeenCalledWith(100);
    expect(inscription2.incrementeValuePaid).toHaveBeenCalledWith(100);
    expect(inscription1.inscriptionPaid).toHaveBeenCalled();
    expect(inscription2.inscriptionPaid).toHaveBeenCalled();

    // Verificar entradas de caixa
    expect(cashRegisterEntryGateway.createManyTx).toHaveBeenCalledTimes(1);
    const createdEntries =
      cashRegisterEntryGateway.createManyTx.mock.calls[0][0];
    expect(createdEntries).toHaveLength(2); // 2 caixas

    // Verificar atualização dos saldos dos caixas
    expect(cashRegisterGateway.updateTx).toHaveBeenCalledTimes(2);
    expect(cashRegister1.incrementBalance).toHaveBeenCalledWith(200);
    expect(cashRegister2.incrementBalance).toHaveBeenCalledWith(200);

    // Verificar atualização do evento - CORRIGIDO
    expect(event.addCollectedAmount).toHaveBeenCalledWith(200);
    expect(event.addNetValueCollected).toHaveBeenCalledWith(200);
    expect(event.addParticipant).toHaveBeenCalledTimes(2); // 2 inscrições x 1 participante
    expect(eventGateway.updateTx).toHaveBeenCalledTimes(1);
  });

  it('deve atualizar o status das inscrições após o pagamento ser processado', async () => {
    const inscription1 = makeInscription({
      id: 'insc-id-1',
      totalValue: 200,
      totalPaid: 0,
      status: InscriptionStatus.PENDING,
    });
    const inscription2 = makeInscription({
      id: 'insc-id-2',
      totalValue: 200,
      totalPaid: 0,
      status: InscriptionStatus.PENDING,
    });

    inscriptionGateway.findManyByIds.mockResolvedValue([
      inscription1,
      inscription2,
    ]);
    inscriptionGateway.countParticipants.mockResolvedValue(1);

    imageOptimizerService.processBase64Image.mockResolvedValue({
      buffer: Buffer.from('test'),
      extension: 'png',
    });
    imageOptimizerService.validateImage.mockResolvedValue(true);
    imageOptimizerService.optimizeImage.mockResolvedValue({
      buffer: Buffer.from('opt'),
      format: 'webp',
    });
    imageOptimizerService.getMimeType.mockReturnValue('image/webp');
    supabaseStorageService.uploadFile.mockResolvedValue(
      'https://supabase.url/image.webp',
    );
    eventGateway.findById.mockResolvedValue(makeEvent());
    cashRegisterEventGateway.findByEventId.mockResolvedValue([]);

    const inputWithMixedInscriptionPaymentStatus: RegisterPaymentAdminInput = {
      ...defaultInput,
      amount: 350,
      inscriptions: [
        { id: 'insc-id-1', amount: 200, index: 0 },
        { id: 'insc-id-2', amount: 150, index: 1 },
      ],
    };

    const output = await usecase.execute(
      inputWithMixedInscriptionPaymentStatus,
    );

    expect(inscription1.inscriptionPaid).toHaveBeenCalled();
    expect(output.inscriptions[0].status).toBe(InscriptionStatus.PAID);
    expect(output.inscriptions[1].status).toBe(InscriptionStatus.PENDING);
    expect(inscription2.inscriptionPaid).not.toHaveBeenCalled();
  });

  it('deve lançar InvalidInscriptionIdUsecaseException quando a busca das inscrições retorna menos inscrições que os IDs enviados', async () => {
    // arrange
    inscriptionGateway.findManyByIds.mockResolvedValue([
      makeInscription({ id: 'insc-id-1' }),
    ]);

    // act
    const act = () => usecase.execute(defaultInput);

    // assert
    await expect(act()).rejects.toBeInstanceOf(
      InvalidInscriptionIdUsecaseException,
    );
    await expect(act()).rejects.toThrow('inscription IDs were not found');
    expect(inscriptionGateway.findManyByIds).toHaveBeenCalledWith([
      'insc-id-1',
      'insc-id-2',
    ]);
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar InvalidInscriptionIdUsecaseException quando o varredura de eventIds retornar mais de um ID de evento', async () => {
    const inscription1 = makeInscription({
      id: 'insc-id-1',
      eventId: 'event-id-1',
    });

    const inscription2 = makeInscription({
      id: 'insc-id-2',
      eventId: 'event-id-2',
    });

    inscriptionGateway.findManyByIds.mockResolvedValue([
      inscription1,
      inscription2,
    ]);

    const act = () => usecase.execute(defaultInput);

    await expect(act()).rejects.toBeInstanceOf(
      InvalidInscriptionIdUsecaseException,
    );
    await expect(act()).rejects.toThrow('different events were provided');
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar EventNotFoundUsecaseException quando o a busca do evento não retornar nenhum evento', async () => {
    const inscription1 = makeInscription({
      id: 'insc-id-1',
      eventId: 'event-id-1',
    });

    const inscription2 = makeInscription({
      id: 'insc-id-2',
      eventId: 'event-id-1',
    });

    inscriptionGateway.findManyByIds.mockResolvedValue([
      inscription1,
      inscription2,
    ]);

    eventGateway.findById.mockResolvedValue(null);

    const act = () => usecase.execute(defaultInput);

    await expect(act()).rejects.toBeInstanceOf(EventNotFoundUsecaseException);
    await expect(act()).rejects.toThrow(
      'not possible to find the event corresponding to registrations',
    );
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar InvalidInscriptionIdUsecaseException quando mistura inscrições guest e não-guest', async () => {
    // arrange
    const guestInscription = makeInscription({
      id: 'insc-id-1',
      isGuest: true,
    });
    const nonGuestInscription = makeInscription({
      id: 'insc-id-2',
      isGuest: false,
    });
    inscriptionGateway.findManyByIds.mockResolvedValue([
      guestInscription,
      nonGuestInscription,
    ]);

    eventGateway.findById.mockResolvedValue(makeEvent());

    // act
    const act = () => usecase.execute(defaultInput);

    // assert
    await expect(act()).rejects.toBeInstanceOf(
      InvalidInscriptionIdUsecaseException,
    );
    await expect(act()).rejects.toThrow(
      'guest and non-guest inscriptions were mixed',
    );
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar o PaymentAllocationExceededUsecaseException quando o valor passado nas inscrições ultrapassar o valor declarado no pagamento', async () => {
    const inscription1 = makeInscription({
      id: 'insc-id-1',
      totalValue: 250,
      totalPaid: 0,
    });

    inscriptionGateway.findManyByIds.mockResolvedValue([inscription1]);
    eventGateway.findById.mockResolvedValue(makeEvent());

    const inputWithAllocatedAmountExceedingPayment: RegisterPaymentAdminInput =
      {
        ...defaultInput,
        amount: 200,
        inscriptions: [{ id: 'insc-id-1', amount: 250.0 }],
      };

    // act
    const act = () => usecase.execute(inputWithAllocatedAmountExceedingPayment);

    // assert
    await expect(act()).rejects.toBeInstanceOf(
      PaymentAllocationExceededUsecaseException,
    );
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar OverpaymentNotAllowedUsecaseException quando amount alocado ultrapassa o débito da inscrição', async () => {
    // arrange
    const inscription = makeInscription({
      id: 'insc-id-1',
      totalValue: 100,
      totalPaid: 50,
    });
    inscriptionGateway.findManyByIds.mockResolvedValue([
      inscription,
      makeInscription({ id: 'insc-id-2', totalValue: 100, totalPaid: 0 }),
    ]);
    eventGateway.findById.mockResolvedValue(makeEvent());

    const inputWithOverpayment: RegisterPaymentAdminInput = {
      ...defaultInput,
      inscriptions: [
        { id: 'insc-id-1', amount: 100 }, // tenta pagar 100 mas só deve 50
        { id: 'insc-id-2', amount: 100 },
      ],
    };

    // act
    const act = () => usecase.execute(inputWithOverpayment);

    // assert
    await expect(act()).rejects.toBeInstanceOf(
      OverpaymentNotAllowedUsecaseException,
    );
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve criar entradas de caixa quando existem cash register events', async () => {
    // arrange
    const inscription = makeInscription({
      id: 'insc-id-1',
      totalValue: 200,
      totalPaid: 0,
    });
    inscriptionGateway.findManyByIds.mockResolvedValue([inscription]);
    inscriptionGateway.countParticipants.mockResolvedValue(1);

    const inputWithSingleInscription: RegisterPaymentAdminInput = {
      ...defaultInput,
      amount: 200,
      inscriptions: [{ id: 'insc-id-1', amount: 200 }],
    };

    imageOptimizerService.processBase64Image.mockResolvedValue({
      buffer: Buffer.from('test'),
      extension: 'png',
    });
    imageOptimizerService.validateImage.mockResolvedValue(true);
    imageOptimizerService.optimizeImage.mockResolvedValue({
      buffer: Buffer.from('opt'),
      format: 'webp',
    });
    imageOptimizerService.getMimeType.mockReturnValue('image/webp');
    supabaseStorageService.uploadFile.mockResolvedValue(
      'https://supabase.url/image.webp',
    );
    eventGateway.findById.mockResolvedValue(makeEvent());

    // Mock com caixa registrador
    const cashRegisterEvent = makeCashRegisterEvent('cash-register-id-1');
    cashRegisterEventGateway.findByEventId.mockResolvedValue([
      cashRegisterEvent,
    ]);

    const cashRegister = makeCashRegister('cash-register-id-1', 1000);
    cashRegisterGateway.findById.mockResolvedValue(cashRegister);

    // act
    const output = await usecase.execute(inputWithSingleInscription);

    // assert
    expect(output.inscriptions).toHaveLength(1);
    expect(cashRegisterEntryGateway.createManyTx).toHaveBeenCalledTimes(1);
    expect(cashRegisterGateway.updateTx).toHaveBeenCalledTimes(1);
    expect(cashRegister.incrementBalance).toHaveBeenCalledWith(200);
  });

  it('deve atualizar os dados do evento: quantidade de participantes, valor arrecadado bruto, valor arrecadado liquido', async () => {
    const inscription1 = makeInscription({
      id: 'insc-id-1',
      totalValue: 200,
      totalPaid: 100,
    });

    const inscription2 = makeInscription({
      id: 'insc-id-2',
      totalValue: 200,
      totalPaid: 100,
    });

    inscriptionGateway.findManyByIds.mockResolvedValue([
      inscription1,
      inscription2,
    ]);
    inscriptionGateway.countParticipants.mockResolvedValue(4);

    imageOptimizerService.processBase64Image.mockResolvedValue({
      buffer: Buffer.from('test'),
      extension: 'png',
    });

    imageOptimizerService.validateImage.mockResolvedValue(true);

    imageOptimizerService.optimizeImage.mockResolvedValue({
      buffer: Buffer.from('opt'),
      format: 'webp',
    });
    imageOptimizerService.getMimeType.mockReturnValue('image/webp');
    supabaseStorageService.uploadFile.mockResolvedValue(
      'https://supabase.url/image.webp',
    );

    const event = makeEvent();
    eventGateway.findById.mockResolvedValue(event);
    cashRegisterEventGateway.findByEventId.mockResolvedValue([]);

    await usecase.execute(defaultInput);

    // CORRIGIDO: usando os métodos corretos do evento
    expect(event.addCollectedAmount).toHaveBeenCalledWith(200);
    expect(event.addNetValueCollected).toHaveBeenCalledWith(200);
    // 2 inscrições x 4 participantes = 8 chamadas ao addParticipant
    expect(event.addParticipant).toHaveBeenCalledTimes(8);
    expect(eventGateway.updateTx).toHaveBeenCalledTimes(1);
  });
});
