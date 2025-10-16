## Documentação de Erros e Exceptions

### Visão Geral

- **Arquitetura**: a API organiza erros por camadas — `Domain`, `Usecases`, `Infra/Services` — e os converte em respostas HTTP na camada `Web` via Exception Filters globais.
- **Contrato base**: toda exception de negócio herda de `Exception`, que possui `internalMessage`, `externalMessage` e `context`.
- **Resposta HTTP**: filtros constroem um corpo padrão com `statusCode`, `timeStamp` e `message` a partir da exception, e definem o status HTTP conforme o tipo.

### Classe Base `Exception`

```1:29:src/shared/exceptions/exception.ts
export class Exception extends Error {
  private readonly internalMessage: string;
  private readonly externalMessage: string;
  private readonly context: string;

  public constructor(
    internalMessage: string,
    externalMessage?: string,
    context?: string
  ) {
    super(internalMessage);
    this.internalMessage = internalMessage;
    this.externalMessage = externalMessage || '';
    this.context = context || '';
    this.name = this.constructor.name;
  }

  public getInternalMessage(): string {
    return this.internalMessage;
  }

  public getExternalMessage(): string {
    return this.externalMessage;
  }

  public getContext(): string {
    return this.context;
  }
}
```

### Corpo de Resposta de Erro

```1:23:src/shared/utils/exception-utils.ts
import { Exception } from "../exceptions/exception";

export type ExceptionResponde = {
  statusCode: number;
  timeStamp: string;
  message: string;
}

export class ExceptionUtils {

  public static buildErrorResponse(
    exception: Exception,
    statusCode: number
  ) {
    const aRespondeData: ExceptionResponde = {
      statusCode: statusCode,
      timeStamp: new Date().toISOString(),
      message: exception.getExternalMessage()
    };

    return aRespondeData
  }
}
```

Exemplo de resposta:

```json
{
  "statusCode": 400,
  "timeStamp": "2025-10-15T12:34:56.789Z",
  "message": "Mensagem pública do erro"
}
```

### Hierarquia por Camada

#### Domínio

```1:12:src/domain/shared/exceptions/domain.exception.ts
import { Exception } from "src/shared/exceptions/exception"

export class DomainException extends Exception {
  public constructor(
    intetrnalMessage: string,
    externalMessage?: string,
    context?: string
  ) {
    super(intetrnalMessage, externalMessage, context);
    this.name = DomainException.name;
  }
}
```

```1:12:src/domain/shared/exceptions/validator-domain.exception.ts
import { DomainException } from "./domain.exception";

export class ValidatorDomainException extends DomainException {
  public constructor(
    internalMessage: string,
    externalMessage?: string,
    context?: string
  ) {
    super(internalMessage, externalMessage, context);
    this.name = ValidatorDomainException.name;
  }
}
```

Uso:

- `ValidatorDomainException`: validação de entidades/VOs.
- `DomainException`: violações de regra/invariantes de domínio.

#### Usecases

```1:12:src/usecases/exceptions/usecase.exception.ts
import { Exception } from "src/shared/exceptions/exception";

export class UsecaseException extends Exception {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string
  ) {
    super(internalMessage, publicMessage, context);
    this.name = 'UsecaseException';
  }
}
```

Uso:

- Parâmetros obrigatórios ausentes, orquestração da aplicação, estado inválido do caso de uso.
- Exceptions específicas (ex.: `MissingRegionIdUsecaseException`, `UserAlreadyExistsUsecaseException`, etc.) refinam o mapeamento para HTTP.

#### Infra/Services

```1:12:src/infra/services/exceptions/service.exception.ts
import { Exception } from "src/shared/exceptions/exception";

export class ServiceException extends Exception {
  public constructor (
    internalMessage: string,
    externalMessage: string,
    context: string
  ) {
    super(internalMessage, externalMessage, context)
    this.name = ServiceException.name
  }
}
```

Uso:

- Falhas de serviços externos/infra (storage, auth, integrações).
- Especializações como `AuthTokenNotValidServiceException` e `RefreshTokenNotValidServiceException` permitem status customizados.

### Mapeamento HTTP via Exception Filters

Os filtros são registrados globalmente no módulo web:

```75:89:src/infra/web/web.module.ts
  providers: [
    AuthGuardProvider,
    RoleGuardProvider,
    ValidatorDomainExceptionFilterProvider,
    DomainExceptionFilterProvider,
    UsecaseExceptionFilterProvider,
    CredentialsNotValidUsecaseExcepitonFilterProvider,
    UserAlreadyExistsUsecaseExceptionFilterProvider,
    UserNotFoundUsecaseExceptionFilterProvider,
    UserNotAllowedToCreateUserUsecaseExceptionFilterProvider,
    AuthTokenNotValidServiceExceptionFilterProvider,
    ServiceExceptionFilterProvider,
    RefreshTokenNotValidServiceExceptionFilterProvider,
  ],
```

Principais filtros e status:

- `DomainException` → 500

```13:32:src/infra/web/filters/domain/domain-exception.filter.ts
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  public catch(exception: DomainException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const DomainExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: DomainExceptionFilter,
};
```

- `ValidatorDomainException` → 400

```8:30:src/infra/web/filters/domain/validator-domain-exception.filter.ts
@Catch(ValidatorDomainException)
export class ValidatorDomainExceptionFilter implements ExceptionFilter{
  public catch(exception: ValidatorDomainException, host: ArgumentsHost) {
    LogUtils.logException(exception)

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST;

    const aResponseData = ExceptionUtils.buildErrorResponse(
      exception,
      status
    )

    response.status(status).json(aResponseData);
  }
}

export const ValidatorDomainExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: ValidatorDomainExceptionFilter,
};
```

- `UsecaseException` → 500

```13:32:src/infra/web/filters/usecases/usecase-exception.filter.ts
@Catch(UsecaseException)
export class UsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: UsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const UsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: UsecaseExceptionFilter,
};
```

- `CredentialsNoValidUsecaseException` → 400

```13:37:src/infra/web/filters/usecases/credentials-not-valid-usecase-exception.filter.ts
@Catch(CredentialsNoValidUsecaseException)
export class CredentialsNotValidUsecaseExcepitonFilter
  implements ExceptionFilter
{
  public catch(
    exception: CredentialsNoValidUsecaseException,
    host: ArgumentsHost,
  ) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const CredentialsNotValidUsecaseExcepitonFilterProvider = {
  provide: APP_FILTER,
  useClass: CredentialsNotValidUsecaseExcepitonFilter,
};
```

- `ServiceException` (regra específica para token) → 500 ou 403

```14:37:src/infra/web/filters/infra/service/server-exception.filter.ts
@Catch(ServiceException)
export class ServiceExceptionFilter implements ExceptionFilter {
  public catch(exception: ServiceException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Se for AuthTokenNotValidServiceException, retorna 403
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof AuthTokenNotValidServiceException) {
      status = HttpStatus.FORBIDDEN;
    }

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const ServiceExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: ServiceExceptionFilter,
};
```

### Como Lançar Erros (Boas Práticas)

- **Preencha** sempre `internalMessage` (detalhado para log); `externalMessage` deve ser curta e sem dados sensíveis; `context` ajuda no rastreio (ex.: `CreateEventUsecase`, `JwtService.verify`).
- **Não** use `HttpException` nas camadas de domínio/usecase/serviço; deixe o mapeamento HTTP para a camada `Web` via filtros.
- Prefira **exceptions específicas** para permitir status customizados pelos filtros.

#### Exemplos

Usecase (parâmetro ausente):

```ts
import { MissingRegionIdUsecaseException } from 'src/usecases/exceptions/events/missing-region-id.usecase.exception';

if (!regionId) {
  throw new MissingRegionIdUsecaseException(
    'Missing regionId on create event flow',
    'Região obrigatória não informada',
    'CreateEventUsecase',
  );
}
```

Domínio (validação):

```ts
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';

throw new ValidatorDomainException(
  'Invalid entity state: name length < 3',
  'Dados inválidos para a entidade',
  'EventEntity.validate',
);
```

Service (token inválido):

```ts
import { AuthTokenNotValidServiceException } from 'src/infra/services/exceptions/auth-token-not-valid.service.exception';

throw new AuthTokenNotValidServiceException(
  'JWT signature invalid or expired',
  'Token de autenticação inválido',
  'JwtService.verify',
);
```

### Fluxo de Tratamento

1. Uma classe lança uma exception que estende `Exception`.
2. Um filtro global (`@Catch(...)`) correspondente captura a exception.
3. O filtro decide o `HttpStatus` (padrão por tipo ou regras específicas).
4. O filtro monta o JSON com `ExceptionUtils.buildErrorResponse`.
5. O cliente recebe uma resposta consistente; logs detalhados são registrados por `LogUtils`.

### Convenções e Dicas

- `externalMessage` deve ser legível, em PT-BR, e voltada ao usuário.
- Evite vazar informações sensíveis em qualquer mensagem pública.
- Use `context` para facilitar observabilidade e correlação em logs.
- Crie novas subclasses quando precisar de status HTTP distintos ou semântica específica.
