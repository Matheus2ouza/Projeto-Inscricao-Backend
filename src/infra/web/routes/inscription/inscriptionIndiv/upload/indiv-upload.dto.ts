export type IndivUploadRequest = {
  responsible: string;
  phone: string;
  eventId: string;
  participant: {
    name: string;
    birthDateStr: string;
    gender: string;
    typeDescriptionId: string;
  };
};

export type IndivUploadRouteResponse = {
  cacheKey: string;
  status: 'PENDING' | 'UNDER_REVIEW';
  participant: {
    name: string;
    birthDate: string;
    gender: string;
    typeDescription: string;
    value: number;
  };
};
