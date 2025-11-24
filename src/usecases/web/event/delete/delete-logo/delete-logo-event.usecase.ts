import { Usecase } from 'src/usecases/usecase';

import { EventGateway } from 'src/domain/repositories/event.gateway';

import { Injectable } from '@nestjs/common';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { EventNotLogoToDeleteUsecaseException } from 'src/usecases/web/exceptions/events/event-not-logo-to-delete.usecase.exception';

export type DeleteLogoEventInput = {
  eventId: string;
};

@Injectable()
export class DeleteLogoEventUsecase
  implements Usecase<DeleteLogoEventInput, void>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(input: DeleteLogoEventInput): Promise<void> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId} in ${DeleteLogoEventUsecase.name}`,
        `Evento não encontrado`,
        DeleteLogoEventUsecase.name,
      );
    }

    const logoUrl = event.getLogoUrl();
    if (!logoUrl) {
      throw new EventNotLogoToDeleteUsecaseException(
        `Event ${event.getId()} does not have a logo to delete`,
        `Evento ${event.getName()} não possui logo para deletar`,
        DeleteLogoEventUsecase.name,
      );
    }

    await this.supabaseStorageService.deleteFile(logoUrl);
    event.deleteLogo();
    await this.eventGateway.deleteLogo(event.getId());
  }
}
