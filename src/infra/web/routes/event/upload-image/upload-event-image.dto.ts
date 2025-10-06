import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadEventImageDto {
  @ApiProperty({
    description: 'ID do evento para o qual a imagem será enviada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
