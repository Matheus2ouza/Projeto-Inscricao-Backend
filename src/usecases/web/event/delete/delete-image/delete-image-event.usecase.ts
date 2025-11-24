import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotImagemToDeleteUsecaseException } from 'src/usecases/web/exceptions/events/event-not-imagem-to-delete.usecase.exception';
import { EventNotFoundUsecaseException } from '../../../exceptions/events/event-not-found.usecase.exception';

export type DeleteImageEventInput = {
  eventId: string;
};

@Injectable()
export class DeleteImageEventUsecase
  implements Usecase<DeleteImageEventInput, void>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(input: DeleteImageEventInput): Promise<void> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId} in ${DeleteImageEventUsecase.name}`,
        `Evento não encontrado`,
        DeleteImageEventUsecase.name,
      );
    }

    const imageUrl = event.getImageUrl();
    if (!imageUrl) {
      throw new EventNotImagemToDeleteUsecaseException(
        `Event ${event.getId()} does not have an image to delete`,
        `Evento ${event.getName()} não possui imagem para deletar`,
        DeleteImageEventUsecase.name,
      );
    }

    await this.supabaseStorageService.deleteFile(imageUrl);
    event.deleteImage();
    await this.eventGateway.deleteImage(event.getId());
  }
}
