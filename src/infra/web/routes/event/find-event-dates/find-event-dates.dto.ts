export type FindEventDateResponse = {
  events: {
    id: string;
    name: string;
    status: string;
    startDate: Date;
    endDate: Date;
  }[];
};
