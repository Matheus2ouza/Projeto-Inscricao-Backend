import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GroupUploadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  responsible: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventId: string;
}

export type GroupUploadResponse = {
  cacheKey: string;
  total: number;
  items: {
    name: string;
    birthDate: string;
    typeDescription: string;
    value: number;
  }[];
};
