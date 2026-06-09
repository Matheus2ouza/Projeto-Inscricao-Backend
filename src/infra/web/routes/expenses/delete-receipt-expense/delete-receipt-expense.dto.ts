export type DeleteReceiptExpenseParams = {
  id: string;
};

export type DeleteReceiptExpenseQuery = {
  receiptIndex: number;
};

export type DeleteReceiptExpenseResponse = {
  deleted: boolean;
  remainingReceipts: number;
};
