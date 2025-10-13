import { Injectable } from '@nestjs/common';
import { PaymentInscription } from 'src/domain/entities/payment-inscription';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { PrismaService } from '../prisma.service';
import { PaymentInscriptionEntityToPaymentInscriptionPrismaModelMapper } from './model/mapper/payment-inscription-entity-to-payment-inscription-prisma-model.mapper';
import { PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper } from './model/mapper/payment-inscription-prisma-model-to-payment-inscription-entity.mapper';

@Injectable()
export class PaymentInscriptionRepository implements PaymentInscriptionGateway {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    paymentInscription: PaymentInscription,
  ): Promise<PaymentInscription> {
    const data =
      PaymentInscriptionEntityToPaymentInscriptionPrismaModelMapper.map(
        paymentInscription,
      );
    const created = await this.prisma.paymentInscription.create({ data });
    return PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
      created,
    );
  }

  public async findById(id: string): Promise<PaymentInscription | null> {
    const aModel = await this.prisma.paymentInscription.findUnique({
      where: { id },
    });

    return aModel
      ? PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
          aModel,
        )
      : null;
  }

  public async findbyInscriptionId(
    id: string,
  ): Promise<PaymentInscription[] | null> {
    const aModel = await this.prisma.paymentInscription.findMany({
      where: { inscriptionId: id },
    });

    return aModel.map(
      PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map,
    );
  }
}
