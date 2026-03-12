import { UpdateMemberOutput } from 'src/usecases/web/members/update-member/update-member.usecase';
import { UpdateMemberResponse } from './update-member.dto';

export class UpdateMemberPresenter {
  public static toHttp(output: UpdateMemberOutput): UpdateMemberResponse {
    return {
      id: output.id,
    };
  }
}
