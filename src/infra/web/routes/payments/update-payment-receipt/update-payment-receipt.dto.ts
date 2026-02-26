export type UpdatePaymentReceiptResquest = {
  paymentId: string;
  isGuest: boolean;
  image: string;
};

export type UpdatePaymentReceiptResponse = {
  paymentId: string;
  image: string;
};
