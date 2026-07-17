export type UpdateEventParam = {
  id: string;
};

export type UpdateEventBody = {
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
};

export type UpdateEventRouteResponse = {
  id: string;
};
