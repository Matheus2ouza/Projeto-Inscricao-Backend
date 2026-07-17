import { InscriptionMode, PaymentMode, statusEvent } from 'generated/prisma';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Utils } from 'src/shared/utils/utils';
import { Event, EventCreateDto } from './event.entity';

// Mock apenas do Utils (geração de UUID), o validator roda de verdade
jest.mock('src/shared/utils/utils');

describe(Event, () => {
  const defaultCreateDto: EventCreateDto = {
    name: 'Evento Teste',
    startDate: new Date('2026-01-01T10:00:00Z'),
    endDate: new Date('2026-01-03T18:00:00Z'),
    regionId: 'a3f1c2e4-1234-4a5b-8c9d-abcdef123456', // UUID válido de verdade
    status: statusEvent.OPEN,
    allowedInscriptionModes: [InscriptionMode.NORMAL],
    allowedPaymentModes: [PaymentMode.CARTAO, PaymentMode.PIX],
    paymentEnabled: true,
    ticketEnabled: true,
    imageUrl: 'events/event-image.webp',
    logoUrl: 'events/event-logo.webp',
    location: 'São Paulo, SP',
    longitude: -46.6333,
    latitude: -23.5505,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Utils.generateUUID as jest.Mock).mockReturnValue('generated-uuid-1');
  });

  describe('create', () => {
    it('Deve criar o evento com sucesso', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const event = Event.create(defaultCreateDto);

      expect(Utils.generateUUID).toHaveBeenCalled();
      expect(event.getId()).toBe('generated-uuid-1');
      expect(event.getName()).toBe('Evento Teste');
      expect(event.getStartDate()).toEqual(new Date('2026-01-01T10:00:00Z'));
      expect(event.getEndDate()).toEqual(new Date('2026-01-03T18:00:00Z'));
      expect(event.getQuantityParticipants()).toBe(0);
      expect(event.getAmountCollected()).toBe(0);
      expect(event.getAmountNetValueCollected()).toBe(0);
      expect(event.getAmountSpent()).toBe(0);
      expect(event.getRegionId()).toBe(defaultCreateDto.regionId);
      expect(event.getStatus()).toBe(statusEvent.OPEN);
      expect(event.getAllowedInscriptionModes()).toEqual([
        InscriptionMode.NORMAL,
      ]);
      expect(event.getAllowedPaymentModes()).toEqual([
        PaymentMode.CARTAO,
        PaymentMode.PIX,
      ]);
      expect(event.getPaymentEnabled()).toBe(true);
      expect(event.getTicketEnabled()).toBe(true);
      expect(event.getImageUrl()).toBe('events/event-image.webp');
      expect(event.getLogoUrl()).toBe('events/event-logo.webp');
      expect(event.getLocation()).toBe('São Paulo, SP');
      expect(event.getLongitude()).toBe(-46.6333);
      expect(event.getLatitude()).toBe(-23.5505);
      expect(event.getCreatedAt()).toEqual(now);
      expect(event.getUpdatedAt()).toEqual(now);

      jest.useRealTimers();
    });

    it('Deve criar o evento com campos opcionais undefined', () => {
      const minimalDto: EventCreateDto = {
        name: 'Evento Mínimo',
        startDate: new Date('2026-01-01T10:00:00Z'),
        endDate: new Date('2026-01-03T18:00:00Z'),
        regionId: 'a3f1c2e4-1234-4a5b-8c9d-abcdef123456',
        status: statusEvent.OPEN,
        allowedInscriptionModes: [InscriptionMode.NORMAL],
        allowedPaymentModes: [PaymentMode.PIX],
        paymentEnabled: false,
      };

      const event = Event.create(minimalDto);

      expect(event.getName()).toBe('Evento Mínimo');
      expect(event.getStatus()).toBe(statusEvent.OPEN);
      expect(event.getPaymentEnabled()).toBe(false);
      expect(event.getTicketEnabled()).toBeUndefined();
      expect(event.getImageUrl()).toBeUndefined();
      expect(event.getLogoUrl()).toBeUndefined();
      expect(event.getLocation()).toBeUndefined();
      expect(event.getLongitude()).toBeUndefined();
      expect(event.getLatitude()).toBeUndefined();
      expect(event.getQuantityParticipants()).toBe(0);
      expect(event.getAmountCollected()).toBe(0);
      expect(event.getAmountNetValueCollected()).toBe(0);
      expect(event.getAmountSpent()).toBe(0);
    });

    it('Deve criar o evento com status OPEN', () => {
      const event = Event.create({
        ...defaultCreateDto,
        status: statusEvent.OPEN,
      });
      expect(event.getStatus()).toBe(statusEvent.OPEN);
    });

    it('Deve criar o evento com status CLOSE', () => {
      const event = Event.create({
        ...defaultCreateDto,
        status: statusEvent.CLOSE,
      });
      expect(event.getStatus()).toBe(statusEvent.CLOSE);
    });

    it('Deve criar o evento com status FINALIZED', () => {
      const event = Event.create({
        ...defaultCreateDto,
        status: statusEvent.FINALIZED,
      });
      expect(event.getStatus()).toBe(statusEvent.FINALIZED);
    });

    it('Deve criar o evento com paymentEnabled false', () => {
      const event = Event.create({
        ...defaultCreateDto,
        paymentEnabled: false,
      });
      expect(event.getPaymentEnabled()).toBe(false);
    });

    it('Deve criar o evento com ticketEnabled false', () => {
      const event = Event.create({ ...defaultCreateDto, ticketEnabled: false });
      expect(event.getTicketEnabled()).toBe(false);
    });

    it('Deve criar o evento com múltiplos modos de inscrição', () => {
      const event = Event.create({
        ...defaultCreateDto,
        allowedInscriptionModes: [
          InscriptionMode.NORMAL,
          InscriptionMode.GUEST,
        ],
      });
      expect(event.getAllowedInscriptionModes()).toEqual([
        InscriptionMode.NORMAL,
        InscriptionMode.GUEST,
      ]);
    });

    it('Deve criar o evento com múltiplos modos de pagamento', () => {
      const event = Event.create({
        ...defaultCreateDto,
        allowedPaymentModes: [
          PaymentMode.CARTAO,
          PaymentMode.PIX,
          PaymentMode.BOLETO,
        ],
      });
      expect(event.getAllowedPaymentModes()).toEqual([
        PaymentMode.CARTAO,
        PaymentMode.PIX,
        PaymentMode.BOLETO,
      ]);
    });

    it('Deve criar o evento com apenas CARTA0 como modo de pagamento', () => {
      const event = Event.create({
        ...defaultCreateDto,
        allowedPaymentModes: [PaymentMode.CARTAO],
      });
      expect(event.getAllowedPaymentModes()).toEqual([PaymentMode.CARTAO]);
    });

    it('Deve criar o evento com apenas PIX como modo de pagamento', () => {
      const event = Event.create({
        ...defaultCreateDto,
        allowedPaymentModes: [PaymentMode.PIX],
      });
      expect(event.getAllowedPaymentModes()).toEqual([PaymentMode.PIX]);
    });

    it('Deve criar o evento sem localização (location undefined)', () => {
      const event = Event.create({
        ...defaultCreateDto,
        location: undefined,
        longitude: undefined,
        latitude: undefined,
      });
      expect(event.getLocation()).toBeUndefined();
      expect(event.getLongitude()).toBeUndefined();
      expect(event.getLatitude()).toBeUndefined();
    });

    it('Deve criar o evento com localização mas sem coordenadas', () => {
      const event = Event.create({
        ...defaultCreateDto,
        location: 'Rio de Janeiro, RJ',
        longitude: undefined,
        latitude: undefined,
      });
      expect(event.getLocation()).toBe('Rio de Janeiro, RJ');
      expect(event.getLongitude()).toBeUndefined();
      expect(event.getLatitude()).toBeUndefined();
    });

    it('Deve criar o evento com imagem e logo nos formatos corretos (.webp)', () => {
      const event = Event.create({
        ...defaultCreateDto,
        imageUrl: 'events/banner.webp',
        logoUrl: 'events/logo.webp',
      });
      expect(event.getImageUrl()).toBe('events/banner.webp');
      expect(event.getLogoUrl()).toBe('events/logo.webp');
    });
  });

  describe('Event - Métodos de Atualização', () => {
    it('deve atualizar o allowedInscriptionMode com sucesso', () => {
      const event = Event.create(defaultCreateDto);
      const newAllowedInscriptionMode = [InscriptionMode.GUEST];
      event.setAllowedInscriptionModes(newAllowedInscriptionMode);

      expect(event.getAllowedInscriptionModes()).toEqual([
        InscriptionMode.GUEST,
      ]);
    });
  });

  describe('create - erros de validação', () => {
    it('Deve lançar um erro quando o nome do evento for muito curto', () => {
      const invalidDto: EventCreateDto = { ...defaultCreateDto, name: 'e' };

      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(/muito curto/i);
    });

    it('Deve lançar um erro quando o nome do evento for muito longo', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        name: 'A'.repeat(81),
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(/muito longo/i);
    });

    it('Deve lançar um erro quando o regionId não for um UUID válido', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        regionId: 'region-id-1',
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
    });

    it('Deve lançar um erro quando a startDate for inválida', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        startDate: null as any,
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(/obrigatório/i);
    });

    it('Deve lançar um erro quando a endDate for inválida', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        endDate: null as any,
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(/obrigatório/i);
    });

    it('Deve lançar um erro quando nenhum modo de inscrição for informado', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        allowedInscriptionModes: [],
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(
        /ao menos um método de inscrição/i,
      );
    });

    it('Deve lançar um erro quando nenhum modo de pagamento for informado', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        allowedPaymentModes: [],
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(
        /ao menos um método de pagamento/i,
      );
    });

    it('Deve lançar um erro quando um modo de inscrição for inválido', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        allowedInscriptionModes: ['INVALID_MODE' as any],
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(
        /Métodos de inscrição aceitos pelo evento invalido/i,
      );
    });

    it('Deve lançar um erro quando um modo de pagamento for inválido', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        allowedPaymentModes: ['INVALID_MODE' as any],
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(
        /Métodos de pagamentos aceitos pelo evento invalido/i,
      );
    });

    it('Deve lançar um erro quando a longitude estiver fora do intervalo válido (>180)', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        longitude: 200,
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(/Longitude inválida/i);
    });

    it('Deve lançar um erro quando a longitude estiver fora do intervalo válido (<-180)', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        longitude: -200,
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(/Longitude inválida/i);
    });

    it('Deve lançar um erro quando a latitude estiver fora do intervalo válido (>90)', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        latitude: 100,
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(/Latitude inválida/i);
    });

    it('Deve lançar um erro quando a latitude estiver fora do intervalo válido (<-90)', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        latitude: -100,
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(/Latitude inválida/i);
    });

    it('Deve lançar um erro quando a imageUrl não seguir o formato esperado (.webp)', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        imageUrl: 'events/banner.png',
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(
        /Formato da imagem é inválida/i,
      );
    });

    it('Deve lançar um erro quando a imageUrl não começar com "events"', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        imageUrl: 'uploads/banner.webp',
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(
        /Formato da imagem é inválida/i,
      );
    });

    it('Deve lançar um erro quando o status for inválido', () => {
      const invalidDto: EventCreateDto = {
        ...defaultCreateDto,
        status: 'INVALID_STATUS' as any,
      };
      expect(() => Event.create(invalidDto)).toThrow(ValidatorDomainException);
      expect(() => Event.create(invalidDto)).toThrow(
        /Status do evento invalido/i,
      );
    });
    it('Deve lançar um erro caso tente atualizar o allowedInscriptionMode com um mode invalido', () => {
      const event = Event.create(defaultCreateDto);
      const allowedInscriptionModeInvalid = ['invalid'];

      expect(() =>
        event.setAllowedInscriptionModes(allowedInscriptionModeInvalid as any),
      ).toThrow();
      expect(() =>
        event.setAllowedInscriptionModes(allowedInscriptionModeInvalid as any),
      ).toThrow(/Métodos de inscrição aceitos pelo evento invalido/i);
    });
  });
});
