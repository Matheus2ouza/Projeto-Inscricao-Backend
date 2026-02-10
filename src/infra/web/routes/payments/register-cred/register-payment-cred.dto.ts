export type RegisterPaymentCredRequest = {
  eventId: string;
  accountId?: string;
  guestEmail?: string;
  isGuest?: boolean;
  totalValue: number;
  client: Client;
  inscriptions: Inscription[];
  passCustomerToAsaas?: string;
};

type Client = {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  address: string;
  addressNumber: string;
  complement: string;
  postalCode: string;
  province: string;
  city: number;
};

type Inscription = {
  id: string;
};

export type RegisterPaymentCredResponse = {
  id: string;
  link: string;
  status: string;
};
