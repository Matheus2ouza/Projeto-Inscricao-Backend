export type GroupConfirmRequest = {
  cacheKey: string;
};

export type GroupConfirmRouteResponse = {
  inscriptionId: string;
  inscriptionStatus: string;
  paymentEnabled: boolean;
};
