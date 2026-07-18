import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  RegisterPaymentGuestPixInput,
  RegisterPaymentGuestPixUsecase,
} from 'src/usecases/web/payments/register-guest-pix/register-payment-guest-pix.usecase';
import {
  RegisterPaymentGuestPixBody,
  RegisterPaymentGuestPixResponse,
} from './register-payment-guest-pix.dto';
import { RegisterPaymentGuestPixPresenter } from './register-payment-guest-pix.presenter';

@Controller('payments')
export class RegisterPaymentGuestPixRoute {
  public constructor(
    private readonly registerPaymentGuestPixUsecase: RegisterPaymentGuestPixUsecase,
  ) {}

  @IsPublic()
  @Post('register/pix/guest')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  public async handle(
    @Body() body: RegisterPaymentGuestPixBody,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<RegisterPaymentGuestPixResponse> {
    const input: RegisterPaymentGuestPixInput = {
      inscriptionId: body.inscriptionId,
      name: body.name,
      email: body.email,
      value: Number(body.value),
      date: body.date,
      file: {
        buffer: file.buffer,
        mimeType: file.mimetype,
      },
    };

    const response = await this.registerPaymentGuestPixUsecase.execute(input);
    return RegisterPaymentGuestPixPresenter.toHttp(response);
  }
}
