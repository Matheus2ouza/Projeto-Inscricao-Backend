import { Controller, Get } from '@nestjs/common';
import {
  FindUserInput,
  FindUserUsecase,
} from 'src/usecases/user/find-by-id/find-user.usecase';
import { FindByIdUserResponse } from './find-by-id-user.dto';
import { FindByIdUserPresenter } from './find-by-id-user.presenter';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';

// /localities/:id
@Controller('users')
export class FindByIdUserRoute {
  public constructor(private readonly findUserUsecase: FindUserUsecase) {}

  @Get('me')
  public async handle(@UserId() userId: string): Promise<FindByIdUserResponse> {
    const input: FindUserInput = {
      id: userId,
    };

    const result = await this.findUserUsecase.execute(input);

    const response = FindByIdUserPresenter.toHttp(result);

    return response;
  }
}
