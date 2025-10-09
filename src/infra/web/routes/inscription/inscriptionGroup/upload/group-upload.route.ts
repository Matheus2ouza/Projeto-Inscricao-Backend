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
import { XlsxGroupParserUtil } from '../shared/parser/xlsx-group-parser.util';
import { UploadValidateGroupUsecase } from 'src/usecases/inscription/group/upload-validate-group.usecase';
import type { UploadValidateGroupInput } from 'src/usecases/inscription/group/upload-validate-group.usecase';
import type {
  GroupUploadRequest,
  GroupUploadRouteResponse,
} from './group-upload.dto';
import { GroupUploadPresenter } from './group-upload.presenter';

@ApiTags('Inscription Group')
@Controller('inscriptions/group')
export class GroupUploadRoute {
  public constructor(
    private readonly uploadValidateGroup: UploadValidateGroupUsecase,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload e validação de planilha XLSX' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  public async handle(
    @UploadedFile() file: Express.Multer.File,
    @Body() request: GroupUploadRequest,
  ): Promise<GroupUploadRouteResponse> {
    if (!file) throw new BadRequestException('Arquivo não enviado');

    const rows = XlsxGroupParserUtil.parse(file.buffer);

    const input: UploadValidateGroupInput = {
      responsible: request.responsible,
      phone: request.phone,
      eventId: request.eventId,
      rows,
    };

    try {
      const result = await this.uploadValidateGroup.execute(input);
      const response = GroupUploadPresenter.toHttp(result);
      return response;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(msg);
    }
  }
}
