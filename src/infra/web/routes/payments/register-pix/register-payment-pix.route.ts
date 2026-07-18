import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  RegisterPaymentPixInput,
  RegisterPaymentPixUsecase,
} from 'src/usecases/web/payments/register-pix/register-payment-pix.usecase';
import type {
  Inscription,
  RegisterPaymentPixParam,
  RegisterPaymentPixRequest,
  RegisterPaymentPixResponse,
} from './register-payment-pix.dto';
import { RegisterPaymentPixPresenter } from './register-payment-pix.presenter';

@Controller('payments')
export class RegisterPaymentPixRoute {
  constructor(
    private readonly registerPaymentUsecase: RegisterPaymentPixUsecase,
  ) {}

  @Post(':eventId/register/pix')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async handle(
    @Param() param: RegisterPaymentPixParam,
    @Body() body: RegisterPaymentPixRequest,
    @UserInfo() user: UserInfoType,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<RegisterPaymentPixResponse> {
    const inscriptionsRaw = body.inscriptions;
    const inscriptions: Inscription[] = inscriptionsRaw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .map((id) => ({ id }));

    const input: RegisterPaymentPixInput = {
      eventId: param.eventId,
      accountId: user.userId,
      name: body.name,
      email: body.email,
      value: Number(body.value),
      date: body.date,
      file: {
        buffer: file.buffer,
        mimeType: file.mimetype,
      },
      inscriptions,
    };

    const response = await this.registerPaymentUsecase.execute(input);
    return RegisterPaymentPixPresenter.toHttp(response);
  }
}
