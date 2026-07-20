import { Injectable } from '@nestjs/common';
import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { AccountParticipant } from 'src/domain/entities/account-participant/account-participant.entity';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { Usecase } from 'src/usecases/usecase';
import { DuplicateMemberUsecaseException } from '../../exceptions/account-participant/duplicate-account-participant.usecase.exception';

export type CreateMembersInput = {
  localityId: string;
  name: string;
  preferredName?: string;
  cpf?: string;
  birthDate: Date;
  gender: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type CreateMembersOutput = {
  id: string;
};

@Injectable()
export class CreateMembersUsecase
  implements Usecase<CreateMembersInput, CreateMembersOutput>
{
  constructor(
    private readonly accountParticipantGateway: AccountParticipantGateway,
  ) {}

  async execute(input: CreateMembersInput): Promise<CreateMembersOutput> {
    // Busca todos os participantes da localidade
    const listParticipants =
      await this.accountParticipantGateway.findAllByLocalityId(
        input.localityId,
      );

    // Remove máscara do CPF de entrada se existir
    const cleanInputCpf = input.cpf ? input.cpf.replace(/\D/g, '') : undefined;

    // Verifica se existe um participante com o mesmo nome OU mesmo CPF
    const existingParticipant = listParticipants.find((participant) => {
      const sameName = participant.getName() === input.name;
      const sameCpf =
        cleanInputCpf && participant.getCpf()
          ? participant.getCpf()?.replace(/\D/g, '') === cleanInputCpf
          : false;

      return sameName || sameCpf;
    });

    // Se encontrou, lança erro
    if (existingParticipant) {
      throw new DuplicateMemberUsecaseException(
        `Tentativa de criar um novo membro mas os dados passados já existem na localidade ${input.localityId}`,
        'Já existe um participante com esses dados cadastrado.',
        CreateMembersUsecase.name,
      );
    }

    // Cria o novo participante
    const accountParticipant = AccountParticipant.create({
      localityId: input.localityId,
      name: input.name,
      preferredName: input.preferredName,
      cpf: cleanInputCpf,
      birthDate: new Date(input.birthDate),
      gender: input.gender,
      shirtSize: input.shirtSize,
      shirtType: input.shirtType,
    });

    await this.accountParticipantGateway.create(accountParticipant);

    return {
      id: accountParticipant.getId(),
    };
  }
}
