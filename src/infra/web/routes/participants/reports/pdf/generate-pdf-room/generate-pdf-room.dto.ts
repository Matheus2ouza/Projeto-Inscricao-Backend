export type GeneratePdfRoomBody = {
  title: string;
  observation?: string;
  listParticipants: (ParticipantsRoom | CustomParticipant)[];
};

export type ParticipantsRoom = {
  id: string;
  isCustom?: false;
};

export type CustomParticipant = {
  id: string;
  name: string;
  isCustom: true;
  locality?: string;
};

export type GeneratePdfRoomResponse = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf';
};
