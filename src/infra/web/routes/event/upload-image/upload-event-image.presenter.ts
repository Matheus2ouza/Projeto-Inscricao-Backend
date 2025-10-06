import { ApiProperty } from '@nestjs/swagger';

export class UploadEventImagePresenter {
  @ApiProperty({
    description: 'URL pública da imagem enviada',
    example:
      'https://your-supabase-project.supabase.co/storage/v1/object/public/images/events/1234567890_abc123.webp',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'ID do evento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  eventId: string;

  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Imagem enviada com sucesso',
  })
  message: string;

  constructor(imageUrl: string, eventId: string) {
    this.imageUrl = imageUrl;
    this.eventId = eventId;
    this.message = 'Imagem enviada com sucesso';
  }
}
