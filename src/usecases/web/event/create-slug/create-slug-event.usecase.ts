import { Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { EventSlug } from 'src/domain/entities/event-slug.entity';
import { EventSlugGateway } from 'src/domain/repositories/event-slug.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type CreateSlugEventInput = {
  eventId: string;
  eventName: string;
};

export type CreateSlugEventOutput = EventSlug | null;

@Injectable()
export class CreateSlugEventUsecase
  implements Usecase<CreateSlugEventInput, CreateSlugEventOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventSlugGateway: EventSlugGateway,
  ) {}

  public async execute(
    input: CreateSlugEventInput,
  ): Promise<CreateSlugEventOutput> {
    // verifica se existe o evento
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      const output: CreateSlugEventOutput = null;
      return output;
    }

    // verifica se já existe um slug com isCurrent true para o evento
    const existingCurrent = await this.eventSlugGateway.findCurrent(
      event.getId(),
    );

    if (existingCurrent) {
      return existingCurrent;
    }

    const eventName = event?.getName() || '';

    // cria o slug. ex: Evento Teste
    const slug = slugify(eventName, {
      replacement: '-',
      lower: false,
      strict: true,
      trim: true,
      locale: 'pt',
    });

    // valida se o slug criado já não existe no banco
    // se já existe então fica tentendo criar com nome diferente.
    // ex: evento-teste fica evento-teste-1
    const uniqueSlug = await this.generateUniqueSlug(slug);

    const eventSlug = EventSlug.create({
      slug: uniqueSlug,
      eventId: event.getId(),
    });

    await this.eventSlugGateway.create(eventSlug);

    const output: CreateSlugEventOutput = eventSlug;

    return output;
  }

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let candidate = baseSlug;
    let attempt = 0;

    while (await this.eventSlugGateway.findBySlug(candidate)) {
      attempt++;
      candidate = `${baseSlug}-${attempt}`;
    }

    return candidate;
  }
}
