import {
  genderType,
  InscriptionStatus,
  ShirtSize,
  ShirtType,
} from 'generated/prisma';
import { AccountParticipantInEvent } from 'src/domain/entities/account-participant-in-event.entity';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
import { Participant } from 'src/domain/entities/participant.entity';
import {
  CreateInscriptionAdminInput,
  CreateInscriptionAdminUsecase,
} from './create-inscription-admin.usecase';

describe(CreateInscriptionAdminUsecase.name, () => {
  let usecase: CreateInscriptionAdminUsecase;
  let eventGateway: jest.Mocked<{
    findById: jest.Mock;
    updateTx: jest.Mock;
  }>;
  let inscriptionGateway: jest.Mocked<{
    createTx: jest.Mock;
  }>;
  let accountParticipantInEventGateway: jest.Mocked<{
    createManyTx: jest.Mock;
  }>;
  let participantGateway: jest.Mocked<{
    createManyTx: jest.Mock;
  }>;
  let typeInscriptionGateway: jest.Mocked<{
    findById: jest.Mock;
  }>;
  let prisma: { runInTransaction: jest.Mock };
  let syncQueue: jest.Mocked<{
    enqueue: jest.Mock;
  }>;

  // Input padrão para os testes
  const defaultInput: CreateInscriptionAdminInput = {
    eventId: 'event-id-1',
    isGuest: false,
    accountId: 'account-id-1',
    responsible: 'João Silva',
    email: 'joao@email.com',
    phone: '11999999999',
    locality: 'São Paulo',
    participants: [
      {
        accountParticipantId: 'acc-part-1',
        typeInscriptionId: 'type-insc-1',
        name: 'João Silva',
        preferredName: 'João',
        shirtSize: ShirtSize.G,
        shirtType: ShirtType.TRADICIONAL,
        birthDate: '1990-01-01',
        cpf: '12345678900',
        gender: genderType.MASCULINO,
      },
      {
        accountParticipantId: 'acc-part-2',
        typeInscriptionId: 'type-insc-2',
        name: 'Maria Silva',
        preferredName: 'Maria',
        shirtSize: ShirtSize.M,
        shirtType: ShirtType.BABYLOOK,
        birthDate: '1992-02-02',
        cpf: '09876543211',
        gender: genderType.FEMININO,
      },
    ],
  };

  // Factory para criar um evento mockado
  const makeEvent = (id = 'event-id-1') =>
    ({
      getId: jest.fn(() => id),
      getName: jest.fn(() => 'Evento Teste'),
      incrementParticipantsCount: jest.fn(), // se necessário
    }) as any;

  // Factory para criar um tipo de inscrição mockado
  const makeTypeInscription = ({
    id = 'type-insc-1',
    value = 100,
  }: Partial<{ id: string; value: number }> = {}) =>
    ({
      getId: jest.fn(() => id),
      getValue: jest.fn(() => value),
    }) as any;

  // Factory para criar uma inscrição mockada
  const makeInscription = ({
    id = 'insc-id-1',
    eventId = 'event-id-1',
    accountId = 'account-id-1',
    isGuest = false,
    responsible = 'inscription-responsible',
    phone = 99999999999,
    email = 'email-inscription@gmail.com',
    totalValue = 0,
    status = InscriptionStatus.PENDING,
  }: Partial<{
    id: string;
    accountId: string;
    eventId: string;
    isGuest: boolean;
    responsible: string;
    phone: number;
    email: string;
    totalValue: number;
    status: InscriptionStatus;
  }> = {}) => {
    let currentTotalValue = totalValue;
    return {
      getId: jest.fn(() => id),
      getAccountId: jest.fn(() => accountId),
      getEventId: jest.fn(() => eventId),
      getIsGuest: jest.fn(() => isGuest),
      getResponsible: jest.fn(() => responsible),
      getPhone: jest.fn(() => phone),
      getEmail: jest.fn(() => email),
      getTotalValue: jest.fn(() => currentTotalValue),
      getStatus: jest.fn(() => status),
      setTotalValue: jest.fn((value: number) => {
        currentTotalValue = value;
      }),
    } as any;
  };

  // Factory para criar AccountParticipantInEvent mockado
  const makeAccountParticipantInEvent = ({
    id = 'apie-id-1',
    accountParticipantId = 'acc-part-1',
    inscriptionId = 'insc-id-1',
    typeInscriptionId = 'type-insc-1',
  }: Partial<{
    id: string;
    accountParticipantId: string;
    inscriptionId: string;
    typeInscriptionId: string;
  }> = {}) =>
    ({
      getId: jest.fn(() => id),
      getAccountParticipantId: jest.fn(() => accountParticipantId),
      getInscriptionId: jest.fn(() => inscriptionId),
      getTypeInscriptionId: jest.fn(() => typeInscriptionId),
    }) as any;

  // Factory para criar Participant mockado (guest)
  const makeParticipant = ({
    id = 'part-id-1',
    inscriptionId = 'insc-id-1',
    typeInscriptionId = 'type-insc-1',
    name = 'Participante Guest',
    cpf = '12345678900',
  }: Partial<{
    id: string;
    inscriptionId: string;
    typeInscriptionId: string;
    name: string;
    cpf: string;
  }> = {}) =>
    ({
      getId: jest.fn(() => id),
      getInscriptionId: jest.fn(() => inscriptionId),
      getTypeInscriptionId: jest.fn(() => typeInscriptionId),
      getName: jest.fn(() => name),
      getCpf: jest.fn(() => cpf),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    // Inicializa mocks
    eventGateway = {
      findById: jest.fn(),
      updateTx: jest.fn(),
    };
    inscriptionGateway = {
      createTx: jest.fn(),
    };
    accountParticipantInEventGateway = {
      createManyTx: jest.fn(),
    };
    participantGateway = {
      createManyTx: jest.fn(),
    };
    typeInscriptionGateway = {
      findById: jest.fn(),
    };
    prisma = {
      runInTransaction: jest.fn((fn) => fn({} as any)),
    };
    syncQueue = {
      enqueue: jest.fn(),
    };

    // Mocks dos métodos estáticos das entidades
    jest
      .spyOn(Inscription, 'create')
      .mockImplementation(
        ({
          accountId,
          eventId,
          guestEmail,
          guestName,
          guestLocality,
          isGuest,
          responsible,
          phone,
          status,
          email,
        }: any) => {
          return makeInscription({
            accountId,
            eventId,
            isGuest,
            status: status || InscriptionStatus.PENDING,
          });
        },
      );

    jest
      .spyOn(AccountParticipantInEvent, 'create')
      .mockImplementation(
        ({ accountParticipantId, inscriptionId, typeInscriptionId }: any) => {
          return makeAccountParticipantInEvent({
            accountParticipantId,
            inscriptionId,
            typeInscriptionId,
          });
        },
      );

    jest
      .spyOn(Participant, 'create')
      .mockImplementation(
        ({
          inscriptionId,
          typeInscriptionId,
          name,
          preferredName,
          shirtSize,
          shirtType,
          birthDate,
          cpf,
          gender,
        }: any) => {
          return makeParticipant({
            inscriptionId,
            typeInscriptionId,
            name,
            cpf,
          });
        },
      );

    // Instancia o usecase
    usecase = new CreateInscriptionAdminUsecase(
      eventGateway as any,
      inscriptionGateway as any,
      accountParticipantInEventGateway as any,
      participantGateway as any,
      typeInscriptionGateway as any,
      prisma as any,
      syncQueue as any,
    );
  });

  it('deve criar inscrição admin com sucesso para contas normais (guest false)', async () => {
    // Arrange
    const event = makeEvent('event-id-1');
    eventGateway.findById.mockResolvedValue(event);

    const typeInscription1 = makeTypeInscription({
      id: 'type-insc-1',
      value: 150,
    });
    const typeInscription2 = makeTypeInscription({
      id: 'type-insc-2',
      value: 200,
    });
    typeInscriptionGateway.findById
      .mockResolvedValueOnce(typeInscription1)
      .mockResolvedValueOnce(typeInscription2);

    const input: CreateInscriptionAdminInput = {
      eventId: 'event-id-1',
      accountId: 'account-id-1',
      isGuest: false,
      responsible: 'João Silva',
      email: 'joao@email.com',
      phone: '11999999999',
      participants: [
        {
          accountParticipantId: 'acc-part-1',
          typeInscriptionId: 'type-insc-1',
        },
        {
          accountParticipantId: 'acc-part-2',
          typeInscriptionId: 'type-insc-2',
        },
      ],
    };

    // Act
    const output = await usecase.execute(input);

    // Assert
    expect(eventGateway.findById).toHaveBeenCalledWith('event-id-1');
    expect(Inscription.create).toHaveBeenCalledWith({
      accountId: 'account-id-1',
      eventId: 'event-id-1',
      guestEmail: undefined,
      guestName: undefined,
      guestLocality: '',
      isGuest: false,
      responsible: 'João Silva',
      phone: '11999999999',
      status: InscriptionStatus.PENDING,
      email: 'joao@email.com',
    });

    expect(typeInscriptionGateway.findById).toHaveBeenCalledTimes(2);
    expect(AccountParticipantInEvent.create).toHaveBeenCalledTimes(2);
    expect(Participant.create).not.toHaveBeenCalled();

    // Executa a transação mockada
    expect(prisma.runInTransaction).toHaveBeenCalledTimes(1);
    const txCallback = prisma.runInTransaction.mock.calls[0][0];
    await txCallback({});

    expect(inscriptionGateway.createTx).toHaveBeenCalled();
    expect(accountParticipantInEventGateway.createManyTx).toHaveBeenCalled();
    expect(participantGateway.createManyTx).not.toHaveBeenCalled();
    expect(eventGateway.updateTx).toHaveBeenCalledWith(event, {});

    const createdInscription = (Inscription.create as jest.Mock).mock.results[0]
      .value;
    expect(createdInscription.setTotalValue).toHaveBeenCalledWith(350);
    expect(output).toEqual({ id: expect.any(String) });
  });

  it('deve criar inscrição admin com sucesso para convidados (guest true)', async () => {
    // Arrange
    const event = makeEvent('event-id-1');
    eventGateway.findById.mockResolvedValue(event);

    const typeInscription1 = makeTypeInscription({
      id: 'type-insc-1',
      value: 100,
    });
    const typeInscription2 = makeTypeInscription({
      id: 'type-insc-2',
      value: 120,
    });
    typeInscriptionGateway.findById
      .mockResolvedValueOnce(typeInscription1)
      .mockResolvedValueOnce(typeInscription2);

    const input: CreateInscriptionAdminInput = {
      eventId: 'event-id-1',
      isGuest: true,
      responsible: 'Maria Silva',
      email: 'maria@email.com',
      phone: '11988888888',
      locality: 'Rio de Janeiro',
      participants: [
        {
          name: 'João Convidado',
          preferredName: 'João',
          shirtSize: ShirtSize.G,
          shirtType: ShirtType.TRADICIONAL,
          birthDate: '1990-01-01',
          cpf: '12345678900',
          gender: genderType.MASCULINO,
          typeInscriptionId: 'type-insc-1',
        },
        {
          name: 'Maria Convidada',
          preferredName: 'Maria',
          shirtSize: ShirtSize.M,
          shirtType: ShirtType.BABYLOOK,
          birthDate: '1992-02-02',
          cpf: '09876543211',
          gender: genderType.FEMININO,
          typeInscriptionId: 'type-insc-2',
        },
      ],
    };

    // Act
    const output = await usecase.execute(input);

    // Assert
    expect(eventGateway.findById).toHaveBeenCalledWith('event-id-1');
    expect(Inscription.create).toHaveBeenCalledWith({
      accountId: undefined,
      eventId: 'event-id-1',
      guestEmail: 'maria@email.com',
      guestName: 'Maria Silva',
      guestLocality: 'Rio de Janeiro',
      isGuest: true,
      responsible: 'Maria Silva',
      phone: '11988888888',
      status: InscriptionStatus.PENDING,
      email: 'maria@email.com',
    });

    expect(typeInscriptionGateway.findById).toHaveBeenCalledTimes(2);
    expect(Participant.create).toHaveBeenCalledTimes(2);
    expect(AccountParticipantInEvent.create).not.toHaveBeenCalled();

    expect(prisma.runInTransaction).toHaveBeenCalledTimes(1);
    const txCallback = prisma.runInTransaction.mock.calls[0][0];
    await txCallback({});

    expect(inscriptionGateway.createTx).toHaveBeenCalled();
    expect(participantGateway.createManyTx).toHaveBeenCalled();
    expect(
      accountParticipantInEventGateway.createManyTx,
    ).not.toHaveBeenCalled();
    expect(eventGateway.updateTx).toHaveBeenCalledWith(event, {});

    const createdInscription = (Inscription.create as jest.Mock).mock.results[0]
      .value;
    expect(createdInscription.setTotalValue).toHaveBeenCalledWith(220);
    expect(output).toEqual({ id: expect.any(String) });
  });
});
