import { FindUserOutput } from 'src/usecases/web/user/find-by-id/find-user.usecase';
import { FindByIdUserResponse } from './find-by-id-user.dto';

export class FindByIdUserPresenter {
  public static toHttp(input: FindUserOutput): FindByIdUserResponse {
    const response: FindByIdUserResponse = {
      id: input.id,
      username: input.username,
      role: input.role,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };

    return response;
  }
}
