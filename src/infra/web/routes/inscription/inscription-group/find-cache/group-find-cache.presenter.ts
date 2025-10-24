import { GroupFindCacheRouteResponse } from './group-find-cache.dto';

type CachePayload = {
  responsible: string;
  phone: string;
  eventId: string;
  items: {
    name: string;
    birthDateISO: string;
    gender: string;
    typeInscriptionId: string;
    typeDescription: string;
    value: number;
  }[];
  total: number;
};

export class GroupFindCachePresenter {
  public static toHttp(
    cacheKey: string,
    payload: CachePayload,
  ): GroupFindCacheRouteResponse {
    const unitValue = payload.items.length > 0 ? payload.items[0].value : 0;

    const response: GroupFindCacheRouteResponse = {
      cacheKey,
      total: payload.total,
      unitValue,
      items: payload.items.map((i) => ({
        name: i.name,
        birthDate: new Date(i.birthDateISO).toLocaleDateString('pt-BR'),
        gender: i.gender,
        typeDescription: i.typeDescription,
        value: i.value,
      })),
    };
    return response;
  }
}
