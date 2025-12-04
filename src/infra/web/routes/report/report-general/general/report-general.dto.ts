export type ReportGeneralRequest = {
  eventId: string;
};

export type ReportGeneralResponse = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  totalInscriptions: number;
  countTypeInscription: number;
  countParticipants: number;
  totalValue: number;
  totalDebt: number;
  typeInscription: TypeInscription;
};

type TypeInscription = {
  id: string;
  description: string;
  amount: number;
  countParticipants: number;
  totalValue: number;
}[];
