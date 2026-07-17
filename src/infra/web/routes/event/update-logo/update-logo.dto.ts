export type UpdateLogoEventRequest = {
  eventId: string;
  file: {
    buffer: Buffer;
    mimeType: string;
  };
};

export type UpdateLogoEventResponse = {
  id: string;
};
