import { FindAllNamesUserOutput } from 'src/usecases/web/user/find-all-username/find-all-names-user.usecase';
import { FindAllNamesUserResponse } from './find-all-names-user.dto';

export class FindAllNamesUserPresenter {
  public static toHttp(
    output: FindAllNamesUserOutput,
  ): FindAllNamesUserResponse {
    return output.map((user) => ({
      id: user.id,
      username: user.username,
      role: user.role,
    }));
  }
}
