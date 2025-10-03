import { IsString, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsDateString()
  date: string;

  @IsString()
  regionId: string;
}
