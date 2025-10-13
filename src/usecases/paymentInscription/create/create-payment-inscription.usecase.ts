import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { StatusPayment } from 'generated/prisma';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { PaymentInscription } from 'src/domain/entities/payment-inscription';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { generateUniqueFileName } from 'src/shared/utils/file-name.util';
import { InvalidImageFormatUsecaseException } from 'src/usecases/exceptions/events/invalid-image-format.usecase.exception';
import { InvalidInscriptionIdUsecaseException } from 'src/usecases/exceptions/paymentInscription/invalid-inscription-id.usecase.exception ';
import { MissingInscriptionIdUsecaseException } from 'src/usecases/exceptions/paymentInscription/missing-inscription-id.usecase.exception';
import { OverpaymentNotAllowedUsecaseException } from 'src/usecases/exceptions/paymentInscription/overpayment-not-allowed.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type CreatePaymentInput = {
  inscriptionId: string;
  accountId: string;
  value: number;
  image: string;
};

export type CreatePaymentOutput = {
  id: string;
};

@Injectable()
export class CreatePaymentInscriptionUsecase
  implements Usecase<CreatePaymentInput, CreatePaymentOutput>
{
  private readonly logger = new Logger(CreatePaymentInscriptionUsecase.name);
  public constructor(
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
  ) {}

  public async execute({
    inscriptionId,
    accountId,
    value,
    image,
  }: CreatePaymentInput): Promise<CreatePaymentOutput> {
    //Validações das inscrições
    if (!inscriptionId) {
      throw new MissingInscriptionIdUsecaseException(
        `attempt to register payment without InscriptionId: ${inscriptionId}`,
        `ID da Inscrição não informado`,
        CreatePaymentInscriptionUsecase.name,
      );
    }

    const inscription = await this.inscriptionGateway.findById(inscriptionId);

    if (!inscription) {
      throw new InvalidInscriptionIdUsecaseException(
        `attempt to register a payment but the inscriptionId does not refer to any inscription: ${inscriptionId}`,
        `ID da inscrição é invalido`,
        CreatePaymentInscriptionUsecase.name,
      );
    }

    const currentDebt = inscription.getTotalValue();

    if (new Decimal(value).greaterThan(currentDebt)) {
      throw new OverpaymentNotAllowedUsecaseException(
        `attempted payment but the amount passed was greater than the amount of the debt: ${value}, inscriptionId: ${inscriptionId}`,
        `O valor passado é maior que a dívida`,
        CreatePaymentInscriptionUsecase.name,
      );
    }

    if (!image) {
      throw new InvalidImageFormatUsecaseException(
        'Payment proof image is required',
        'A imagem do comprovante é obrigatória',
        CreatePaymentInscriptionUsecase.name,
      );
    }

    let status: StatusPayment = 'UNDER_REVIEW';
    const eventId = inscription.getEventId();
    const imageUrl = await this.processEventImage(image, eventId);

    const paymentInscription = PaymentInscription.create({
      inscriptionId: inscriptionId,
      eventId: eventId,
      accountId: accountId,
      status: status,
      value: Decimal(value),
      imageUrl: imageUrl,
    });

    const transaction = FinancialMovement.create({
      eventId: eventId,
      accountId: accountId,
      type: 'INCOME',
      value: Decimal(value),
    });

    await this.financialMovementGateway.create(transaction);
    await this.paymentInscriptionGateway.create(paymentInscription);
    await this.inscriptionGateway.decrementValue(inscriptionId, value);
    await this.eventGateway.incrementValue(eventId, value);

    if (new Decimal(currentDebt).minus(value).equals(0)) {
      await this.inscriptionGateway.paidRegistration(inscriptionId);
    }

    const output: CreatePaymentOutput = {
      id: paymentInscription.getId(),
    };
    return output;
  }

  private async processEventImage(
    image: string,
    eventId: string,
  ): Promise<string> {
    this.logger.log('Processando imagem do evento');

    const { buffer, extension } =
      await this.imageOptimizerService.processBase64Image(image);

    // Cria nome único de arquivo
    const fileName = generateUniqueFileName(`payment_${eventId}`, extension);

    // Valida a imagem
    const isValidImage = await this.imageOptimizerService.validateImage(
      buffer,
      fileName,
    );
    if (!isValidImage) {
      throw new InvalidImageFormatUsecaseException(
        'invalid image format',
        'Formato da imagem inválido',
        CreatePaymentInscriptionUsecase.name,
      );
    }

    // Otimiza imagem (ex: converte para webp e reduz tamanho)
    const optimizedImage = await this.imageOptimizerService.optimizeImage(
      buffer,
      {
        maxWidth: 800,
        maxHeight: 800,
        quality: 70,
        format: 'webp',
        maxFileSize: 300 * 1024, // 300KB
      },
    );

    // Nome final do arquivo
    const finalFileName = this.imageOptimizerService.generateUniqueFileName(
      fileName,
      optimizedImage.format,
    );
    // Faz upload no Supabase
    const imageUrl = await this.supabaseStorageService.uploadFile({
      folderName: 'payments',
      fileName: finalFileName,
      fileBuffer: optimizedImage.buffer,
      contentType: this.imageOptimizerService.getMimeType(
        optimizedImage.format,
      ),
    });

    return imageUrl;
  }
}
