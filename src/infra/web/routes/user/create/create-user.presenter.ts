import { CreateUserOutput } from 'src/usecases/user/create/create-user.usecase';
import { CreateUserRouteResponse } from './create-user.dto';

export class CreateUserPresenter {
  public static toHttp(input: CreateUserOutput): CreateUserRouteResponse {
    const response: CreateUserRouteResponse = {
      id: input.id,
    };
    return response;
  }
}
