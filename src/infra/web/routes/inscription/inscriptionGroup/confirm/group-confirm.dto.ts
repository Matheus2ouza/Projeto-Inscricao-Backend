import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export type GroupConfirmRequest = {
  cacheKey: string;
};

export type GroupConfirmRouteResponse = {
  inscriptionId: string;
  paymentEnabled: boolean;
};
