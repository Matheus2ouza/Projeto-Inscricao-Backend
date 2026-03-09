export type FindFutureReleasesCashRegisterRequest = {
  id: string;
};

export type FindFutureReleasesCashRegisterResponse = {
  releaseDate: Date;
  amount: number;
}[];
