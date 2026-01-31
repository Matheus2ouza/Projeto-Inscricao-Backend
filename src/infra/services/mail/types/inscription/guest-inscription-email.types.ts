export interface GuestInscriptionEmailData {
  eventName: string;
  guestName: string;
  guestEmail: string;
  accessUrl: string;
}

export interface GuestInscriptionEmailTemplateData
  extends Record<string, unknown> {
  guestData: GuestInscriptionEmailData;
  year?: number;
}
