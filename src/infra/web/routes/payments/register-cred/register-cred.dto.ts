export type RegisterCredRequest = {
  eventId: string;
  accountId: string;
  totalValue: number;
  client: Client;
  inscriptions: inscription[];
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

type inscription = {
  id: string;
};

export type RegisterCredResponse = {
  id: string;
  link: string;
  status: string;
};
