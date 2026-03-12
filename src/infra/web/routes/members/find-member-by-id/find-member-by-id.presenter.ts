import { FindMemberByIdOutput } from 'src/usecases/web/members/find-member-by-id/find-member-by-id.usecase';
import { FindMemberByIdResponse } from './find-member-by-id.dto';

export class FindMemberByIdPresenter {
  public static toHttp(output: FindMemberByIdOutput): FindMemberByIdResponse {
    return {
      id: output.id,
      name: output.name,
      preferredName: output.preferredName,
      cpf: output.cpf,
      birthDate: output.birthDate,
      gender: output.gender,
      shirtSize: output.shirtSize,
      shirtType: output.shirtType,
      createdAt: output.createdAt,
    };
  }
}
