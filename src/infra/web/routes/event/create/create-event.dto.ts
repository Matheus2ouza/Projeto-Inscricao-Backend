export type CreateEventRequest = {
  name: string;
  startDate: Date;
  endDate: Date;
  regionId: string;
  image?: string;
};

export type CreateEventRouteResponse = {
  id: string;
};
