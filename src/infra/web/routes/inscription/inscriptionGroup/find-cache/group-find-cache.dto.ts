export type GroupFindCacheRequest = {
  cacheKey: string;
};

export type GroupFindCacheRouteResponse = {
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
