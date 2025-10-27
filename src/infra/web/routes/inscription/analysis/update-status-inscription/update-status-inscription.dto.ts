import { InscriptionStatus } from "generated/prisma";

export type UpdateStatusInscriptionRequest = {
  status: InscriptionStatus
}

export type UpdateStatusInscriptionResponse = {
  id: string;
  status: string;
}
