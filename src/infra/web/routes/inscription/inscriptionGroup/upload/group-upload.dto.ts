import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export type GroupUploadRequest = {
  responsible: string;
  phone: string;
  eventId: string;
};

export type GroupUploadRouteResponse = {
  cacheKey: string;
  total: number;
  unitValue: number;
  items: {
    name: string;
    birthDate: string;
    typeDescription: string;
    value: number;
  }[];
};
