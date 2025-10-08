import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GroupConfirmDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cacheKey: string;
}

export type GroupConfirmResponse = {
  inscriptionId: string;
  totalParticipants: number;
};
