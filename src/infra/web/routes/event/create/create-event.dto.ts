export type CreateEventRequest = {
  name: string;
  startDate: Date;
  endDate: Date;
  regionId: string;
  image?: string;
  location?: string;
  longitude?: number;
  latitude?: number;
  isOpen?: boolean;
};

export type CreateEventRouteResponse = {
  id: string;
};
