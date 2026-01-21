import { UpdateAllowCardOutput } from 'src/usecases/web/event/update-allow-card/update-allow-card.usecase';
import { UpdateAllowCardResponse } from './update-allow-card.dto';

export class UpdateAllowCardPresenter {
  public static toHttp(output: UpdateAllowCardOutput): UpdateAllowCardResponse {
    return {
      allowCard: output.allowCard,
    };
  }
}
