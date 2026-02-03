export interface GuestInscriptionEmailData {
  eventName: string;
  guestName: string;
  guestEmail: string;
  accessUrl: string;
  confirmationCode: string;
  eventImageUrl?: string;
  eventLocation?: string;
  eventDate?: string;
}

export interface GuestInscriptionEmailTemplateData
  extends Record<string, unknown> {
  guestData: GuestInscriptionEmailData;
  year?: number;
}
