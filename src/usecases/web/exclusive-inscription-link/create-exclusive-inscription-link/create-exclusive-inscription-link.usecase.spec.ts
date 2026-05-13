import { ExclusiveInscriptionLinkType } from 'src/domain/entities/exclusive-inscription-link-type.entity';
import { ExclusiveInscriptionLink } from 'src/domain/entities/exclusive-inscription-link.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { ExclusiveInscriptionLinkTypeGateway } from 'src/domain/repositories/exclusive-inscription-link-type.gateway';
import { ExclusiveInscriptionLinkGateway } from 'src/domain/repositories/exclusive-inscription-link.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from '../../exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';
import { ParticipantLimitReachedUsecaseException } from '../../exceptions/type-Inscription/participant-limit-reached.usecase.exception';
import {
  CreateExclusiveInscriptionLinkInput,
  CreateExclusiveInscriptionLinkUsecase,
} from './create-exclusive-inscription-link.usecase';

describe(CreateExclusiveInscriptionLinkUsecase.name, () => {
  let usecase: CreateExclusiveInscriptionLinkUsecase;
  let eventGateway: jest.Mocked<Pick<EventGateway, 'findById'>>;
  let typeInscriptionGateway: jest.Mocked<
    Pick<TypeInscriptionGateway, 'findByIdsAndEventId'>
  >;
  let exclusiveInscriptionLinkGateway: jest.Mocked<
    Pick<ExclusiveInscriptionLinkGateway, 'createTx'>
  >;
  let exclusiveInscriptionLinkTypeGateway: jest.Mocked<
    Pick<ExclusiveInscriptionLinkTypeGateway, 'createTx'>
  >;
  let prisma: {
    runInTransaction: jest.Mock;
  };

  const defaultInput: CreateExclusiveInscriptionLinkInput = {
    eventId: 'event-id-1',
    typeInscriptionIds: ['type-id-1', 'type-id-2'],
    name: 'Link exclusivo',
    createdBy: 'account-id-1',
    expiresAt: new Date('2030-01-01T00:00:00.000Z'),
  };

  const makeTypeInscription = ({
    id,
    participantLimit = 10,
    limitIsStrict = false,
    currentCount = 0,
  }: {
    id: string;
    participantLimit?: number;
    limitIsStrict?: boolean;
    currentCount?: number;
  }) =>
    ({
      getId: jest.fn(() => id),
      getParticipantLimit: jest.fn(() => participantLimit),
      getLimitIsStrict: jest.fn(() => limitIsStrict),
      currentCount,
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    eventGateway = {
      findById: jest.fn(),
    };

    typeInscriptionGateway = {
      findByIdsAndEventId: jest.fn(),
    };

    exclusiveInscriptionLinkGateway = {
      createTx: jest.fn(),
    };

    exclusiveInscriptionLinkTypeGateway = {
      createTx: jest.fn(),
    };

    prisma = {
      runInTransaction: jest.fn((fn) => fn({} as any)),
    };

    jest.spyOn(ExclusiveInscriptionLink, 'create').mockReturnValue({
      getId: jest.fn(() => 'exclusive-link-id-1'),
    } as any);

    jest
      .spyOn(ExclusiveInscriptionLinkType, 'create')
      .mockImplementation(({ exclusiveLinkId, typeInscriptionId }) => {
        return {
          getId: jest.fn(() => `${exclusiveLinkId}-${typeInscriptionId}`),
          getExclusiveLinkId: jest.fn(() => exclusiveLinkId),
          getTypeInscriptionId: jest.fn(() => typeInscriptionId),
        } as any;
      });

    usecase = new CreateExclusiveInscriptionLinkUsecase(
      eventGateway as unknown as EventGateway,
      typeInscriptionGateway as unknown as TypeInscriptionGateway,
      exclusiveInscriptionLinkGateway as unknown as ExclusiveInscriptionLinkGateway,
      exclusiveInscriptionLinkTypeGateway as unknown as ExclusiveInscriptionLinkTypeGateway,
      prisma as unknown as PrismaService,
    );
  });

  it('deve lançar EventNotFoundUsecaseException quando findById retorna null', async () => {
    // arrange
    eventGateway.findById.mockResolvedValue(null);

    // act
    const act = () => usecase.execute(defaultInput);

    // assert
    await expect(act()).rejects.toBeInstanceOf(EventNotFoundUsecaseException);
    expect(eventGateway.findById).toHaveBeenCalledWith(defaultInput.eventId);
    expect(typeInscriptionGateway.findByIdsAndEventId).not.toHaveBeenCalled();
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar TypeInscriptionNotFoundUsecaseException quando findByIdsAndEventId retorna menos tipos que os IDs enviados', async () => {
    // arrange
    eventGateway.findById.mockResolvedValue({
      getId: jest.fn(() => defaultInput.eventId),
    } as any);
    typeInscriptionGateway.findByIdsAndEventId.mockResolvedValue([
      makeTypeInscription({ id: 'type-id-1' }),
    ]);

    // act
    const act = () => usecase.execute(defaultInput);

    // assert
    await expect(act()).rejects.toBeInstanceOf(
      TypeInscriptionNotFoundUsecaseException,
    );
    expect(typeInscriptionGateway.findByIdsAndEventId).toHaveBeenCalledWith(
      defaultInput.typeInscriptionIds,
      defaultInput.eventId,
    );
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve lançar ParticipantLimitReachedUsecaseException quando tipo strict atingiu o limite de participantes', async () => {
    // arrange
    eventGateway.findById.mockResolvedValue({
      getId: jest.fn(() => defaultInput.eventId),
    } as any);
    typeInscriptionGateway.findByIdsAndEventId.mockResolvedValue([
      makeTypeInscription({
        id: 'type-id-1',
        participantLimit: 10,
        limitIsStrict: true,
        currentCount: 10,
      }),
      makeTypeInscription({ id: 'type-id-2' }),
    ]);

    // act
    const act = () => usecase.execute(defaultInput);

    // assert
    await expect(act()).rejects.toBeInstanceOf(
      ParticipantLimitReachedUsecaseException,
    );
    expect(prisma.runInTransaction).not.toHaveBeenCalled();
  });

  it('deve criar o link com sucesso', async () => {
    // arrange
    eventGateway.findById.mockResolvedValue({
      getId: jest.fn(() => defaultInput.eventId),
    } as any);
    typeInscriptionGateway.findByIdsAndEventId.mockResolvedValue([
      makeTypeInscription({ id: 'type-id-1' }),
      makeTypeInscription({ id: 'type-id-2' }),
    ]);

    // act
    const output = await usecase.execute(defaultInput);

    // assert
    expect(output).toEqual({ id: 'exclusive-link-id-1' });
    expect(prisma.runInTransaction).toHaveBeenCalledTimes(1);
    expect(exclusiveInscriptionLinkGateway.createTx).toHaveBeenCalledTimes(1);
    expect(exclusiveInscriptionLinkTypeGateway.createTx).toHaveBeenCalledTimes(
      defaultInput.typeInscriptionIds.length,
    );
  });

  it('deve deduplicar IDs duplicados no input', async () => {
    // arrange
    const input: CreateExclusiveInscriptionLinkInput = {
      ...defaultInput,
      typeInscriptionIds: ['type-id-1', 'type-id-1'],
    };

    eventGateway.findById.mockResolvedValue({
      getId: jest.fn(() => input.eventId),
    } as any);
    typeInscriptionGateway.findByIdsAndEventId.mockResolvedValue([
      makeTypeInscription({ id: 'type-id-1' }),
    ]);

    // act
    const output = await usecase.execute(input);

    // assert
    expect(output).toEqual({ id: 'exclusive-link-id-1' });
    expect(typeInscriptionGateway.findByIdsAndEventId).toHaveBeenCalledWith(
      ['type-id-1'],
      input.eventId,
    );
    expect(exclusiveInscriptionLinkGateway.createTx).toHaveBeenCalledTimes(1);
    expect(exclusiveInscriptionLinkTypeGateway.createTx).toHaveBeenCalledTimes(
      1,
    );
  });
});
