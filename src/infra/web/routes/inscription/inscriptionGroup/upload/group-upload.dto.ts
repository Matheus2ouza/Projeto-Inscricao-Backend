export type GroupUploadRequest = {
  responsible: string;
  phone: string;
  eventId: string;
};

export type GroupUploadRouteResponse = {
  cacheKey: string;
  total: number;
  unitValue: number;
  status: 'PENDING' | 'UNDER_REVIEW';
  items: {
    name: string;
    birthDate: string;
    gender: string;
    typeDescription: string;
    value: number;
  }[];
};
