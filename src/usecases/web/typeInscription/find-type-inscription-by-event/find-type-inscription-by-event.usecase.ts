import { Injectable } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { UserRoleType } from 'src/infra/web/authenticator/decorators/user-role.decorator';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type FindTypeInscriptionByEventInput = {
  user: UserRoleType;
  eventId: string;
};

export type FindTypeInscriptionByEventOutput = {
  id: string;
  description: string;
  value: number;
  rule: Date | null;
  specialType: boolean;
  active?: boolean;
  participantLimit?: number;
  limitIsStrict?: boolean;
  createdAt?: Date;
}[];

@Injectable()
export class FindTypeInscriptionByEventUsecase
  implements
    Usecase<FindTypeInscriptionByEventInput, FindTypeInscriptionByEventOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  async execute(
    input: FindTypeInscriptionByEventInput,
  ): Promise<FindTypeInscriptionByEventOutput> {
    // Verifica se o usuário está autenticado (tem o role setado)
    const isAuthenticated = !!input.user?.userRole;

    // Verifica se o role é diferente de 'user' (apenas se estiver autenticado)
    const isAdminOrStaff =
      isAuthenticated && input.user.userRole !== roleType.USER;

    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempt to list type inscriptions for event ${input.eventId} that does not exist`,
        `Não foi possível encontrar o evento informado.`,
        FindTypeInscriptionByEventUsecase.name,
      );
    }

    const typeInscriptions = await this.typeInscriptionGateway.findByEventId(
      event.getId(),
    );

    const output: FindTypeInscriptionByEventOutput = typeInscriptions.map(
      (typeInscription) => {
        // Se estiver autenticado e não for um user, envia todos os dados
        if (isAdminOrStaff) {
          return {
            id: typeInscription.getId(),
            description: typeInscription.getDescription(),
            rule: typeInscription.getRule(),
            value: typeInscription.getValue(),
            specialType: typeInscription.getSpecialType(),
            active: typeInscription.getActive(),
            participantLimit: typeInscription.getParticipantLimit(),
            limitIsStrict: typeInscription.getLimitIsStrict(),
            createdAt: typeInscription.getCreatedAt(),
          };
        }

        // Caso não estiver autenticado então enviamos somente os dados básicos
        return {
          id: typeInscription.getId(),
          description: typeInscription.getDescription(),
          value: typeInscription.getValue(),
          rule: typeInscription.getRule(),
          specialType: typeInscription.getSpecialType(),
        };
      },
    );

    return output;
  }
}
