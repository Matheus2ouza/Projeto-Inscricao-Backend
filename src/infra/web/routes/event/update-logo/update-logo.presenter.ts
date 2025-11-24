import { UpdateLogoEventOutput } from 'src/usecases/web/event/update-logo/update-logo.usecase';
import { UpdateLogoEventResponse } from './update-logo.dto';

export class UpdateLogoEventPresenter {
  public static toHttp(output: UpdateLogoEventOutput): UpdateLogoEventResponse {
    return {
      id: output.id,
    };
  }
}
