import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { UploadEventImageUsecase } from 'src/usecases/event/upload-image/upload-event-image.usecase';
import { UploadEventImagePresenter } from './upload-event-image.presenter';
import { AuthGuard } from 'src/infra/web/authenticator/guards/auth.guard';
import { RoleGuard } from 'src/infra/web/authenticator/guards/role.guard';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';

@ApiTags('Events')
@Controller('events')
@UseGuards(AuthGuard, RoleGuard)
export class UploadEventImageRoute {
  private readonly logger = new Logger(UploadEventImageRoute.name);

  constructor(
    private readonly uploadEventImageUsecase: UploadEventImageUsecase,
  ) {}

  @Post(':eventId/upload-image')
  @Roles(RoleTypeHierarchy.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Upload de imagem para evento',
    description:
      'Faz upload de uma imagem para um evento específico. A imagem será comprimida e otimizada antes do armazenamento. Formatos suportados: JPEG e PNG.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID do evento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Imagem enviada com sucesso',
    type: UploadEventImagePresenter,
  })
  @ApiResponse({
    status: 400,
    description:
      'Dados inválidos ou arquivo não é uma imagem válida (apenas JPEG e PNG são suportados)',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para realizar esta ação',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado',
  })
  async uploadImage(
    @Param('eventId') eventId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadEventImagePresenter> {
    try {
      this.logger.log(`Recebendo upload de imagem para evento: ${eventId}`);

      // Valida se o arquivo foi enviado
      if (!file) {
        this.logger.warn('Nenhum arquivo foi enviado');
        throw new BadRequestException('Nenhum arquivo foi enviado');
      }

      // Valida se é uma imagem
      if (!file.mimetype.startsWith('image/')) {
        this.logger.warn(`Tipo de arquivo inválido: ${file.mimetype}`);
        throw new BadRequestException(
          'Apenas arquivos de imagem são permitidos',
        );
      }

      // Valida o tamanho do arquivo (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.logger.warn(`Arquivo muito grande: ${file.size} bytes`);
        throw new BadRequestException(
          'Arquivo muito grande. Tamanho máximo permitido: 5MB',
        );
      }

      this.logger.log(
        `Processando arquivo: ${file.originalname} (${file.size} bytes, ${file.mimetype})`,
      );

      // Executa o use case
      const result = await this.uploadEventImageUsecase.execute({
        eventId,
        fileBuffer: file.buffer,
        originalName: file.originalname,
        contentType: file.mimetype,
      });

      this.logger.log(`Upload concluído com sucesso para evento: ${eventId}`);

      return new UploadEventImagePresenter(result.imageUrl, result.eventId);
    } catch (error) {
      this.logger.error(
        `Erro no upload de imagem para evento ${eventId}: ${error.message}`,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error.message || 'Erro interno do servidor',
      );
    }
  }
}
