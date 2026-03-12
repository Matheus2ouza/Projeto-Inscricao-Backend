import { FindAllMembersByAccountUsecaseOutput } from 'src/usecases/web/members/find-all-members-by-account/find-all-members-by-account.usecase';
import { FindAllMembersByAccountUsecaseResponse } from './find-all-members-by-account.dto';

export class FindAllMembersByAccountPresenter {
  public static toHttp(
    output: FindAllMembersByAccountUsecaseOutput,
  ): FindAllMembersByAccountUsecaseResponse {
    return output.map((o) => ({
      id: o.id,
      name: o.name,
      cpf: o.cpf,
      preferredName: o.preferredName,
      birthDate: o.birthDate,
      gender: o.gender,
      shirtSize: o.shirtSize,
      shirtType: o.shirtType,
      registered: o.registered,
    }));
  }
}
