export type IndivConfirmRequest = {
  cacheKey: string;
};

export type ConfirmIndivRouteResponse = {
  inscriptionId: string;
  inscriptionStatus: string;
  paymentEnabled: boolean;
};
