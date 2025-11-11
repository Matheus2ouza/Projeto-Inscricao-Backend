export type FindAccountWithInscriptionsResponse = {
  accounts: AccountWithInscriptions[];
};
export type Inscriptions = {
  id: string;
  name: string;
  createAt: Date;
  countParticipants: number;
}[];

export type AccountWithInscriptions = {
  id: string;
  username: string;
  countInscriptons: number;
  inscriptions: Inscriptions;
};
