import { roleType } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import {
  FindAllPaginatedUsersInput,
  FindAllPaginatedUsersUsecase,
} from './find-all-paginated.usecase';

describe(FindAllPaginatedUsersUsecase.name, () => {
  let usecase: FindAllPaginatedUsersUsecase;
  let accountGateway: jest.Mocked<
    Pick<AccountGateway, 'findManyPaginated' | 'countAll'>
  >;
  let regionGateway: jest.Mocked<Pick<RegionGateway, 'findById'>>;

  const createdAt = new Date('2026-01-02T00:00:00.000Z');
  const updatedAt = new Date('2026-01-03T00:00:00.000Z');

  const defaultInput: FindAllPaginatedUsersInput = {
    page: 1,
    pageSize: 10,
  };

  const makeAccount = ({
    id,
    username,
    role = roleType.USER,
    regionId,
  }: {
    id: string;
    username: string;
    role?: roleType;
    regionId?: string;
  }) =>
    ({
      getId: jest.fn(() => id),
      getUsername: jest.fn(() => username),
      getRole: jest.fn(() => role),
      getCreatedAt: jest.fn(() => createdAt),
      getUpdatedAt: jest.fn(() => updatedAt),
      getRegionId: jest.fn(() => regionId),
    }) as any;

  const makeRegion = (name: string) =>
    ({
      getName: jest.fn(() => name),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();

    accountGateway = {
      findManyPaginated: jest.fn(),
      countAll: jest.fn(),
    };

    regionGateway = {
      findById: jest.fn(),
    };

    usecase = new FindAllPaginatedUsersUsecase(
      accountGateway as unknown as AccountGateway,
      regionGateway as unknown as RegionGateway,
    );
  });

  it('deve buscar usuários paginados sem filtro de região quando regionId não for informado', async () => {
    // Preparação
    accountGateway.findManyPaginated.mockResolvedValue([
      makeAccount({
        id: 'account-id-1',
        username: 'Usuário 1',
      }),
    ]);
    accountGateway.countAll.mockResolvedValue(1);

    // Ação
    const output = await usecase.execute(defaultInput);

    // Verificação
    expect(accountGateway.findManyPaginated).toHaveBeenCalledWith(
      1,
      10,
      undefined,
    );
    expect(accountGateway.countAll).toHaveBeenCalledWith(undefined);
    expect(regionGateway.findById).not.toHaveBeenCalled();
    expect(output).toEqual({
      users: [
        {
          id: 'account-id-1',
          username: 'Usuário 1',
          role: roleType.USER,
          createdAt,
          updatedAt,
          regionName: undefined,
        },
      ],
      total: 1,
      page: 1,
      pageCount: 1,
    });
  });

  it('deve aplicar o regionId informado apenas como filtro da consulta', async () => {
    // Preparação
    const input: FindAllPaginatedUsersInput = {
      ...defaultInput,
      regionId: 'region-id-do-acesso',
    };

    accountGateway.findManyPaginated.mockResolvedValue([
      makeAccount({
        id: 'account-id-1',
        username: 'Usuário da Região',
        regionId: 'region-id-do-usuario',
      }),
    ]);
    accountGateway.countAll.mockResolvedValue(1);
    regionGateway.findById.mockResolvedValue(makeRegion('Região Norte'));

    // Ação
    const output = await usecase.execute(input);

    // Verificação
    expect(accountGateway.findManyPaginated).toHaveBeenCalledWith(
      1,
      10,
      'region-id-do-acesso',
    );
    expect(accountGateway.countAll).toHaveBeenCalledWith('region-id-do-acesso');
    expect(regionGateway.findById).toHaveBeenCalledWith('region-id-do-usuario');
    expect(output.users).toEqual([
      {
        id: 'account-id-1',
        username: 'Usuário da Região',
        role: roleType.USER,
        createdAt,
        updatedAt,
        regionName: 'Região Norte',
      },
    ]);
  });

  it('deve normalizar página e tamanho da página antes de consultar o gateway', async () => {
    // Preparação
    accountGateway.findManyPaginated.mockResolvedValue([]);
    accountGateway.countAll.mockResolvedValue(0);

    const input: FindAllPaginatedUsersInput = {
      page: -10,
      pageSize: 500,
    };

    // Ação
    const output = await usecase.execute(input);

    // Verificação
    expect(accountGateway.findManyPaginated).toHaveBeenCalledWith(
      1,
      100,
      undefined,
    );
    expect(accountGateway.countAll).toHaveBeenCalledWith(undefined);
    expect(output.page).toBe(1);
    expect(output.pageCount).toBe(1);
  });

  it('deve calcular a quantidade de páginas com base no total e no tamanho da página', async () => {
    // Preparação
    accountGateway.findManyPaginated.mockResolvedValue([]);
    accountGateway.countAll.mockResolvedValue(25);

    const input: FindAllPaginatedUsersInput = {
      page: 2,
      pageSize: 10,
    };

    // Ação
    const output = await usecase.execute(input);

    // Verificação
    expect(accountGateway.findManyPaginated).toHaveBeenCalledWith(
      2,
      10,
      undefined,
    );
    expect(output.total).toBe(25);
    expect(output.page).toBe(2);
    expect(output.pageCount).toBe(3);
  });
});
