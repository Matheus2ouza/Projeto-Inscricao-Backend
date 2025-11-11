export type UpdateEventRequest = {
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  responsibles: string[];
};

export type UpdateEventRouteResponse = {
  id: string;
};
