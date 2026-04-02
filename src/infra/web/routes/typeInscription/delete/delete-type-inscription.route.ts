import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  DeletetypeInscriptionInput,
  DeletetypeInscriptionUsecase,
} from 'src/usecases/web/typeInscription/delete-type-inscription/delete-type-inscription.usecase';
import { DeletetypeInscriptionParams } from './delete-type-inscription.dto';

@Controller('type-inscription')
export class DeletetypeInscriptionRoute {
  constructor(
    private readonly deletetypeInscriptionUsecase: DeletetypeInscriptionUsecase,
  ) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Param() params: DeletetypeInscriptionParams): Promise<void> {
    const input: DeletetypeInscriptionInput = {
      id: params.id,
    };

    await this.deletetypeInscriptionUsecase.execute(input);
  }
}
