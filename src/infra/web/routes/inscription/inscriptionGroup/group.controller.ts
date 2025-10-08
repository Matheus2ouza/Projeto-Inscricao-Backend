import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupUploadDto, GroupUploadResponse } from './group-upload.dto';
import { GroupConfirmDto, GroupConfirmResponse } from './group-confirm.dto';
import { XlsxGroupParserUtil } from './parser/xlsx-group-parser.util';
import { UploadValidateGroupUsecase } from 'src/usecases/inscription/group/upload-validate-group.usecase';
import { ConfirmGroupUsecase } from 'src/usecases/inscription/group/confirm-group.usecase';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';

@ApiTags('Inscription Group')
@Controller('inscriptions/group')
export class InscriptionGroupController {
  constructor(
    private readonly uploadValidateGroup: UploadValidateGroupUsecase,
    private readonly confirmGroup: ConfirmGroupUsecase,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload e validação de planilha XLSX' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: GroupUploadDto,
  ): Promise<GroupUploadResponse> {
    if (!file) throw new BadRequestException('Arquivo não enviado');
    const rows = XlsxGroupParserUtil.parse(file.buffer);
    try {
      const result = await this.uploadValidateGroup.execute({
        responsible: body.responsible,
        phone: body.phone,
        eventId: body.eventId,
        rows,
      });
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(msg);
    }
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmar inscrições em grupo' })
  async confirm(
    @Body() body: GroupConfirmDto,
    @UserId() accountId: string,
  ): Promise<GroupConfirmResponse> {
    try {
      const result = await this.confirmGroup.execute({
        cacheKey: body.cacheKey,
        accountId,
      });
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(msg);
    }
  }
}
