export type GroupUploadRequest = {
  responsible: string;
  email: string;
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
    gender: string;
    typeDescription: string;
    value: number;
  }[];
};
