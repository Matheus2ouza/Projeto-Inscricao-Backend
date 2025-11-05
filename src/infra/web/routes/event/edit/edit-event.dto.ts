export type EditEventRequest = {
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  responsibles: string[];
};

export type EditEventRouteResponse = {
  id: string;
};
