import { FindUserOutput } from 'src/usecases/web/user/find-by-id/find-user.usecase';
import { FindByIdUserResponse } from './find-by-id-user.dto';

export class FindByIdUserPresenter {
  public static toHttp(output: FindUserOutput): FindByIdUserResponse {
    const response: FindByIdUserResponse = {
      id: output.id,
      username: output.username,
      email: output.email,
      role: output.role,
      regionId: output.regionId,
    };

    return response;
  }
}
