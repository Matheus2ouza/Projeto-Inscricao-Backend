export interface InscriptionStatusEmailData {
  inscriptionId: string;
  responsibleName: string;
  responsibleEmail: string;
  eventName: string;
  eventLocation?: string;
  decisionDate: Date;
}

export interface InscriptionStatusEmailTemplateData
  extends Record<string, unknown> {
  statusData: InscriptionStatusEmailData;
  year?: number;
}
