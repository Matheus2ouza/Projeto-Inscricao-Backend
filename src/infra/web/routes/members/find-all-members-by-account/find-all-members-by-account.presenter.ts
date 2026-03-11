import { FindAllMembersByAccountUsecaseOutput } from 'src/usecases/web/members/find-all-members-by-account/find-all-members-by-account.usecase';
import { FindAllMembersByAccountUsecaseResponse } from './find-all-members-by-account.dto';

export class FindAllMembersByAccountPresenter {
  public static toHttp(
    output: FindAllMembersByAccountUsecaseOutput,
  ): FindAllMembersByAccountUsecaseResponse {
    return output.map((member) => ({
      id: member.id,
      name: member.name,
      preferredName: member.preferredName,
      cpf: member.cpf,
      birthDate: member.birthDate,
      gender: member.gender,
      shirtSize: member.shirtSize,
      shirtType: member.shirtType,
    }));
  }
}
