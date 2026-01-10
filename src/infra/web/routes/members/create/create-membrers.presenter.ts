import { CreateMembersOutput } from 'src/usecases/web/members/create/create-membrers.usecase';
import { CreateMembersResponse } from './create-membrers.dto';

export class CreateMembersPresenter {
  public static toResponse(output: CreateMembersOutput): CreateMembersResponse {
    return {
      id: output.id,
    };
  }
}
