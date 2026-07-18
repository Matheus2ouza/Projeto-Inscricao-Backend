import { InscriptionMode, PaymentMode, statusEvent } from 'generated/prisma';
import { EventResponsible } from 'src/domain/entities/event-responsibles.entity';
import { Event } from 'src/domain/entities/event/event.entity';
import { RegionNotFoundUsecaseException } from 'src/usecases/web/exceptions/accounts/region-not-found.usecase.exception';
import { EventNameAlreadyExistsUsecaseException } from 'src/usecases/web/exceptions/events/event-name-already-exists.usecase.exception';
import { InvalidImageFormatUsecaseException } from 'src/usecases/web/exceptions/payment/invalid-image-format.usecase.exception';
import { AccountNotFoundUsecaseException } from '../../exceptions/accounts/account-not-found.usecase.exception';
import { CreateEventInput, CreateEventUseCase } from './create-event.usecase';

describe(CreateEventUseCase.name, () => {
  let usecase: CreateEventUseCase;
  let eventGateway: jest.Mocked<{
    findByNameAndRegionId: jest.Mock;
    createTx: jest.Mock;
  }>;
  let regionGateway: jest.Mocked<{ findById: jest.Mock }>;
  let accountGateway: jest.Mocked<{ findEligibleResponsibles: jest.Mock }>;
  let eventResponsibleGateway: jest.Mocked<{ createManyTx: jest.Mock }>;
  let supabaseStorageService: jest.Mocked<{
    uploadFile: jest.Mock;
    calculateFolderSize: jest.Mock;
  }>;
  let imageOptimizerService: jest.Mocked<{
    processBase64Image: jest.Mock;
    validateImage: jest.Mock;
    optimizeImage: jest.Mock;
    getMimeType: jest.Mock;
  }>;
  let prisma: { runInTransaction: jest.Mock };

  // Input padrão para os testes
  const defaultInput: CreateEventInput = {
    name: 'Evento Teste',
    startDate: new Date('2026-01-01T10:00:00Z'),
    endDate: new Date('2026-01-03T18:00:00Z'),
    regionId: 'region-id-1',
    status: statusEvent.OPEN,
    allowedInscriptionModes: [InscriptionMode.NORMAL],
    allowedPaymentModes: [PaymentMode.CARTA0, PaymentMode.PIX],
    paymentEnabled: true,
    responsibles: [{ accountId: 'account-id-1' }],
    image: undefined,
    location: 'São Paulo, SP',
    longitude: -46.6333,
    latitude: -23.5505,
  };

  // Factory para criar uma região mockada
  const makeRegion = (id = 'region-id-1', name = 'Região Teste') =>
    ({
      getId: jest.fn(() => id),
      getName: jest.fn(() => name),
    }) as any;

  // Factory para criar um evento mockado
  const makeEvent = (id = 'event-id-1', name = 'Evento Teste') =>
    ({
      getId: jest.fn(() => id),
      getName: jest.fn(() => name),
      getRegionId: jest.fn(() => 'region-id-1'),
    }) as any;

  // Factory para criar uma conta mockada
  const makeAccount = (id = 'account-id-1') =>
    ({
      getId: jest.fn(() => id),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    // Inicializa mocks
    eventGateway = {
      findByNameAndRegionId: jest.fn(),
      createTx: jest.fn(),
    };
    regionGateway = {
      findById: jest.fn(),
    };
    accountGateway = {
      findEligibleResponsibles: jest.fn(),
    };
    eventResponsibleGateway = {
      createManyTx: jest.fn(),
    };
    supabaseStorageService = {
      uploadFile: jest.fn(),
      calculateFolderSize: jest.fn(),
    };
    imageOptimizerService = {
      processBase64Image: jest.fn(),
      validateImage: jest.fn(),
      optimizeImage: jest.fn(),
      getMimeType: jest.fn(),
    };
    prisma = {
      runInTransaction: jest.fn((fn) => fn({} as any)),
    };

    // Mocks dos métodos estáticos das entidades
    jest
      .spyOn(Event, 'create')
      .mockImplementation(
        ({
          name,
          startDate,
          endDate,
          regionId,
          imageUrl,
          location,
          longitude,
          latitude,
          status,
          allowedInscriptionModes,
          allowedPaymentModes,
          paymentEnabled,
          ticketEnabled,
        }: any) => {
          return {
            getId: jest.fn(() => 'event-id-1'),
            getName: jest.fn(() => name),
            getStartDate: jest.fn(() => startDate),
            getEndDate: jest.fn(() => endDate),
            getRegionId: jest.fn(() => regionId),
            getImageUrl: jest.fn(() => imageUrl),
            getLocation: jest.fn(() => location),
            getLongitude: jest.fn(() => longitude),
            getLatitude: jest.fn(() => latitude),
            getStatus: jest.fn(() => status),
            getAllowedInscriptionModes: jest.fn(() => allowedInscriptionModes),
            getAllowedPaymentModes: jest.fn(() => allowedPaymentModes),
            getPaymentEnabled: jest.fn(() => paymentEnabled),
            getTicketEnabled: jest.fn(() => ticketEnabled),
          } as any;
        },
      );

    jest.spyOn(EventResponsible, 'create').mockImplementation(
      ({ eventId, accountId }: any) =>
        ({
          getEventId: jest.fn(() => eventId),
          getAccountId: jest.fn(() => accountId),
        }) as any,
    );

    // Instancia o usecase
    usecase = new CreateEventUseCase(
      eventGateway as any,
      regionGateway as any,
      accountGateway as any,
      eventResponsibleGateway as any,
      supabaseStorageService as any,
      imageOptimizerService as any,
      prisma as any,
    );
  });

  it('deve criar evento com sucesso', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const account = makeAccount();
    accountGateway.findEligibleResponsibles.mockResolvedValue([account]);

    const imageBuffer = Buffer.from('test');
    imageOptimizerService.processBase64Image.mockResolvedValue({
      buffer: imageBuffer,
      extension: 'png',
    });
    imageOptimizerService.validateImage.mockResolvedValue(true);
    imageOptimizerService.optimizeImage.mockResolvedValue({
      buffer: Buffer.from('optimized'),
      format: 'webp',
    });
    imageOptimizerService.getMimeType.mockReturnValue('image/webp');
    supabaseStorageService.uploadFile.mockResolvedValue(
      'https://supabase.url/events/evento-teste_2026-01-01_10-00-00.webp',
    );

    const inputWithImage: CreateEventInput = {
      ...defaultInput,
      image: 'data:image/png;base64,imagemock',
    };

    // Act
    const output = await usecase.execute(inputWithImage);

    // Assert
    expect(regionGateway.findById).toHaveBeenCalledWith('region-id-1');
    expect(eventGateway.findByNameAndRegionId).toHaveBeenCalledWith(
      'Evento Teste',
      'region-id-1',
    );
    expect(accountGateway.findEligibleResponsibles).toHaveBeenCalledWith([
      'account-id-1',
    ]);

    expect(Event.create).toHaveBeenCalledWith({
      name: 'Evento Teste',
      startDate: defaultInput.startDate,
      endDate: defaultInput.endDate,
      regionId: 'region-id-1',
      imageUrl:
        'https://supabase.url/events/evento-teste_2026-01-01_10-00-00.webp',
      location: 'São Paulo, SP',
      longitude: -46.6333,
      latitude: -23.5505,
      status: statusEvent.OPEN,
      allowedInscriptionModes: [InscriptionMode.NORMAL],
      allowedPaymentModes: [PaymentMode.CARTA0, PaymentMode.PIX],
      paymentEnabled: true,
      ticketEnabled: false,
    });

    expect(prisma.runInTransaction).toHaveBeenCalledTimes(1);
    const txCallback = prisma.runInTransaction.mock.calls[0][0];
    await txCallback({});

    expect(eventGateway.createTx).toHaveBeenCalled();
    expect(eventResponsibleGateway.createManyTx).toHaveBeenCalled();
    expect(output).toEqual({ id: 'event-id-1' });
  });

  it('deve criar evento sem imagem', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const account = makeAccount();
    accountGateway.findEligibleResponsibles.mockResolvedValue([account]);

    const inputWithoutImage: CreateEventInput = {
      ...defaultInput,
      image: undefined,
    };

    // Act
    const output = await usecase.execute(inputWithoutImage);

    // Assert
    expect(Event.create).toHaveBeenCalledWith({
      name: 'Evento Teste',
      startDate: defaultInput.startDate,
      endDate: defaultInput.endDate,
      regionId: 'region-id-1',
      imageUrl: undefined,
      location: 'São Paulo, SP',
      longitude: -46.6333,
      latitude: -23.5505,
      status: statusEvent.OPEN,
      allowedInscriptionModes: [InscriptionMode.NORMAL],
      allowedPaymentModes: [PaymentMode.CARTA0, PaymentMode.PIX],
      paymentEnabled: true,
      ticketEnabled: false,
    });

    expect(imageOptimizerService.processBase64Image).not.toHaveBeenCalled();
    expect(output).toEqual({ id: 'event-id-1' });
  });

  it('deve criar evento sem responsáveis', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const inputWithoutResponsibles: CreateEventInput = {
      ...defaultInput,
      responsibles: [],
    };

    // Act
    const output = await usecase.execute(inputWithoutResponsibles);

    // Assert
    expect(accountGateway.findEligibleResponsibles).not.toHaveBeenCalled();
    expect(eventResponsibleGateway.createManyTx).not.toHaveBeenCalled();
    expect(output).toEqual({ id: 'event-id-1' });
  });

  it('deve lançar RegionNotFoundUsecaseException quando a região não existe', async () => {
    // Arrange
    regionGateway.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(usecase.execute(defaultInput)).rejects.toBeInstanceOf(
      RegionNotFoundUsecaseException,
    );
    await expect(usecase.execute(defaultInput)).rejects.toThrow(
      /não é referente a nenhuma região/i,
    );
    expect(eventGateway.findByNameAndRegionId).not.toHaveBeenCalled();
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar EventNameAlreadyExistsUsecaseException quando já existe evento com mesmo nome na região', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    const existingEvent = makeEvent();
    eventGateway.findByNameAndRegionId.mockResolvedValue(existingEvent);

    // Act & Assert
    await expect(usecase.execute(defaultInput)).rejects.toBeInstanceOf(
      EventNameAlreadyExistsUsecaseException,
    );
    await expect(usecase.execute(defaultInput)).rejects.toThrow(
      /already exists/i,
    );
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar AccountNotFoundUsecaseException quando um responsável não existe', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    accountGateway.findEligibleResponsibles.mockResolvedValue([]);

    // Act & Assert
    await expect(usecase.execute(defaultInput)).rejects.toBeInstanceOf(
      AccountNotFoundUsecaseException,
    );
    await expect(usecase.execute(defaultInput)).rejects.toThrow(
      /não atende os requisitos/i,
    );
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar InvalidImageFormatUsecaseException quando a imagem é inválida', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const account = makeAccount();
    accountGateway.findEligibleResponsibles.mockResolvedValue([account]);

    imageOptimizerService.processBase64Image.mockResolvedValue({
      buffer: Buffer.from('test'),
      extension: 'png',
    });
    imageOptimizerService.validateImage.mockResolvedValue(false);

    // Criando input com imagem para este teste específico
    const inputWithImage: CreateEventInput = {
      ...defaultInput,
      image: 'data:image/png;base64,imagemock',
    };

    // Act & Assert
    await expect(usecase.execute(inputWithImage)).rejects.toBeInstanceOf(
      InvalidImageFormatUsecaseException,
    );
    await expect(usecase.execute(inputWithImage)).rejects.toThrow(
      /Image file is not valid/i,
    );
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar InvalidImageFormatUsecaseException quando o processamento da imagem falha', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const account = makeAccount();
    accountGateway.findEligibleResponsibles.mockResolvedValue([account]);

    imageOptimizerService.processBase64Image.mockRejectedValue(
      new Error('Erro ao processar imagem'),
    );

    // Criando input com imagem para este teste específico
    const inputWithImage: CreateEventInput = {
      ...defaultInput,
      image: 'data:image/png;base64,imagemock',
    };

    // Act & Assert
    await expect(usecase.execute(inputWithImage)).rejects.toBeInstanceOf(
      InvalidImageFormatUsecaseException,
    );
    await expect(usecase.execute(inputWithImage)).rejects.toThrow(
      /Failed to process event image/i,
    );
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve criar evento com localização mas sem coordenadas', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const account = makeAccount();
    accountGateway.findEligibleResponsibles.mockResolvedValue([account]);

    const inputWithoutCoords: CreateEventInput = {
      ...defaultInput,
      image: undefined,
      longitude: undefined,
      latitude: undefined,
    };

    // Act
    const output = await usecase.execute(inputWithoutCoords);

    // Assert
    expect(Event.create).toHaveBeenCalledWith({
      name: 'Evento Teste',
      startDate: defaultInput.startDate,
      endDate: defaultInput.endDate,
      regionId: 'region-id-1',
      imageUrl: undefined,
      location: 'São Paulo, SP',
      longitude: undefined,
      latitude: undefined,
      status: statusEvent.OPEN,
      allowedInscriptionModes: [InscriptionMode.NORMAL],
      allowedPaymentModes: [PaymentMode.CARTA0, PaymentMode.PIX],
      paymentEnabled: true,
      ticketEnabled: false,
    });

    expect(output).toEqual({ id: 'event-id-1' });
  });

  it('deve criar evento com múltiplos responsáveis', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const accounts = [makeAccount('account-id-1'), makeAccount('account-id-2')];
    accountGateway.findEligibleResponsibles.mockResolvedValue(accounts);

    const inputWithMultipleResponsibles: CreateEventInput = {
      ...defaultInput,
      responsibles: [
        { accountId: 'account-id-1' },
        { accountId: 'account-id-2' },
      ],
    };

    // Act
    const output = await usecase.execute(inputWithMultipleResponsibles);

    // Assert
    expect(accountGateway.findEligibleResponsibles).toHaveBeenCalledWith([
      'account-id-1',
      'account-id-2',
    ]);
    expect(EventResponsible.create).toHaveBeenCalledTimes(2);
    expect(eventResponsibleGateway.createManyTx).toHaveBeenCalledTimes(1);
    expect(output).toEqual({ id: 'event-id-1' });
  });

  it('deve criar evento com status CLOSE', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const account = makeAccount();
    accountGateway.findEligibleResponsibles.mockResolvedValue([account]);

    const inputWithCloseStatus: CreateEventInput = {
      ...defaultInput,
      status: statusEvent.CLOSE,
    };

    // Act
    const output = await usecase.execute(inputWithCloseStatus);

    // Assert
    expect(Event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: statusEvent.CLOSE,
      }),
    );
    expect(output).toEqual({ id: 'event-id-1' });
  });

  it('deve criar evento com paymentEnabled false', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const account = makeAccount();
    accountGateway.findEligibleResponsibles.mockResolvedValue([account]);

    const inputWithoutPayment: CreateEventInput = {
      ...defaultInput,
      paymentEnabled: false,
    };

    // Act
    const output = await usecase.execute(inputWithoutPayment);

    // Assert
    expect(Event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentEnabled: false,
      }),
    );
    expect(output).toEqual({ id: 'event-id-1' });
  });

  it('deve criar evento com múltiplos modos de inscrição', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const account = makeAccount();
    accountGateway.findEligibleResponsibles.mockResolvedValue([account]);

    const inputWithMultipleModes: CreateEventInput = {
      ...defaultInput,
      allowedInscriptionModes: [InscriptionMode.NORMAL, InscriptionMode.GUEST],
    };

    // Act
    const output = await usecase.execute(inputWithMultipleModes);

    // Assert
    expect(Event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        allowedInscriptionModes: [
          InscriptionMode.NORMAL,
          InscriptionMode.GUEST,
        ],
      }),
    );
    expect(output).toEqual({ id: 'event-id-1' });
  });

  it('deve criar evento com múltiplos modos de pagamento', async () => {
    // Arrange
    const region = makeRegion();
    regionGateway.findById.mockResolvedValue(region);

    eventGateway.findByNameAndRegionId.mockResolvedValue(null);

    const account = makeAccount();
    accountGateway.findEligibleResponsibles.mockResolvedValue([account]);

    const inputWithMultiplePayments: CreateEventInput = {
      ...defaultInput,
      allowedPaymentModes: [
        PaymentMode.CARTA0,
        PaymentMode.PIX,
        PaymentMode.BOLETO,
      ],
    };

    // Act
    const output = await usecase.execute(inputWithMultiplePayments);

    // Assert
    expect(Event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        allowedPaymentModes: [
          PaymentMode.CARTA0,
          PaymentMode.PIX,
          PaymentMode.BOLETO,
        ],
      }),
    );
    expect(output).toEqual({ id: 'event-id-1' });
  });
});
