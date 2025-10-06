import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp';
  maxFileSize?: number; // em bytes
}

export interface OptimizedImageResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

@Injectable()
export class ImageOptimizerService {
  private readonly logger = new Logger(ImageOptimizerService.name);

  // Formatos de imagem suportados
  private readonly supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];

  // Tamanho máximo de entrada (5MB)
  private readonly maxInputFileSize = 5 * 1024 * 1024;

  /**
   * Valida se o arquivo é uma imagem suportada
   * @param buffer - Buffer do arquivo
   * @param originalName - Nome original do arquivo
   * @returns true se for uma imagem válida
   */
  async validateImage(buffer: Buffer, originalName: string): Promise<boolean> {
    try {
      // Verifica o tamanho do arquivo
      if (buffer.length > this.maxInputFileSize) {
        console.warn(
          `File too large: ${buffer.length} bytes (max: ${this.maxInputFileSize})`,
        );
        this.logger.warn(
          `Arquivo muito grande: ${buffer.length} bytes (máximo: ${this.maxInputFileSize})`,
        );
        return false;
      }

      // Verifica a extensão do arquivo
      const extension = originalName.split('.').pop()?.toLowerCase();
      if (!extension || !this.supportedFormats.includes(extension)) {
        console.warn(`Unsupported format: .${extension}`);
        this.logger.warn(`Formato não suportado: ${extension}`);
        return false;
      }

      // Verifica se é uma imagem válida usando Sharp
      const metadata = await sharp(buffer).metadata();
      if (!metadata.format) {
        console.warn('File is not a valid image');
        this.logger.warn('Arquivo não é uma imagem válida');
        return false;
      }

      console.info(
        `Valid image: ${originalName} (${metadata.format}, ${metadata.width}x${metadata.height})`,
      );
      this.logger.log(
        `Imagem válida: ${originalName} (${metadata.format}, ${metadata.width}x${metadata.height})`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Erro na validação da imagem: ${error.message}`);
      return false;
    }
  }

  /**
   * Otimiza uma imagem reduzindo seu tamanho e melhorando a qualidade
   * @param buffer - Buffer da imagem original
   * @param options - Opções de otimização
   * @returns Resultado da otimização com buffer, formato e metadados
   */
  async optimizeImage(
    buffer: Buffer,
    options: ImageOptimizationOptions = {},
  ): Promise<OptimizedImageResult> {
    try {
      const {
        maxWidth = 1200, // Reduzido para economizar espaço
        maxHeight = 800, // Reduzido para economizar espaço
        quality = 70, // Qualidade mais baixa para menor tamanho
        format = 'webp',
        maxFileSize = 500 * 1024, // 500KB por padrão - muito menor para economizar espaço
      } = options;

      this.logger.log(
        `Iniciando otimização da imagem (${maxWidth}x${maxHeight}, qualidade inicial: ${quality}, formato: ${format})`,
      );

      // Obtém metadados da imagem original
      const originalMetadata = await sharp(buffer).metadata();
      this.logger.log(
        `Imagem original: ${originalMetadata.width}x${originalMetadata.height}, formato: ${originalMetadata.format}, tamanho: ${buffer.length} bytes`,
      );

      // Se a imagem já é pequena o suficiente, retorna otimizada
      if (buffer.length <= maxFileSize) {
        this.logger.log('Imagem já está dentro do limite de tamanho');
      }

      // Tenta diferentes níveis de qualidade até atingir o tamanho desejado
      let currentQuality = quality;
      let optimizedBuffer: Buffer;
      let attempts = 0;
      const maxAttempts = 8; // Mais tentativas para melhor compressão

      do {
        attempts++;
        this.logger.log(`Tentativa ${attempts}: qualidade ${currentQuality}`);

        // Configura o Sharp para otimização agressiva
        const sharpInstance = sharp(buffer)
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({
            quality: currentQuality,
            effort: 6, // Máximo esforço para melhor compressão
            lossless: false, // Sempre com perda para menor tamanho
            nearLossless: false, // Desabilita para menor tamanho
          });

        optimizedBuffer = await sharpInstance.toBuffer();

        this.logger.log(
          `Tentativa ${attempts}: ${optimizedBuffer.length} bytes (limite: ${maxFileSize})`,
        );

        // Se atingiu o tamanho desejado ou é a última tentativa, para
        if (optimizedBuffer.length <= maxFileSize || attempts >= maxAttempts) {
          break;
        }

        // Reduz a qualidade de forma mais agressiva
        if (attempts <= 3) {
          currentQuality = Math.max(30, currentQuality - 20);
        } else {
          currentQuality = Math.max(10, currentQuality - 10);
        }
      } while (attempts < maxAttempts);

      const optimizedMetadata = await sharp(optimizedBuffer).metadata();

      const result: OptimizedImageResult = {
        buffer: optimizedBuffer,
        format: optimizedMetadata.format || format,
        width: optimizedMetadata.width || 0,
        height: optimizedMetadata.height || 0,
        size: optimizedBuffer.length,
      };

      const compressionRatio = (
        ((buffer.length - optimizedBuffer.length) / buffer.length) *
        100
      ).toFixed(2);

      this.logger.log(
        `Otimização concluída: ${result.width}x${result.height}, formato: ${result.format}, tamanho: ${result.size} bytes (${compressionRatio}% de redução)`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Erro na otimização da imagem: ${error.message}`);
      throw new Error(`Falha na otimização da imagem: ${error.message}`);
    }
  }

  /**
   * Gera um nome único para o arquivo baseado no timestamp e formato
   * @param originalName - Nome original do arquivo
   * @param format - Formato de saída
   * @returns Nome único do arquivo
   */
  generateUniqueFileName(originalName: string, format: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = format === 'jpeg' ? 'jpeg' : format;

    return `${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Obtém o tipo MIME baseado no formato da imagem
   * @param format - Formato da imagem
   * @returns Tipo MIME correspondente
   */
  getMimeType(format: string): string {
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  /**
   * Obtém os formatos de imagem suportados
   * @returns Array com os formatos suportados
   */
  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }

  /**
   * Obtém o tamanho máximo de arquivo de entrada permitido
   * @returns Tamanho máximo em bytes
   */
  getMaxInputFileSize(): number {
    return this.maxInputFileSize;
  }

  /**
   * Processa uma imagem base64 e retorna o buffer e metadados
   * @param base64DataUrl - Data URL base64 da imagem
   * @returns Buffer da imagem e metadados
   */
  async processBase64Image(base64DataUrl: string): Promise<{
    buffer: Buffer;
    extension: string;
    mimeType: string;
    originalName: string;
  }> {
    try {
      const match = base64DataUrl.match(/^data:(image\/(\w+));base64,(.+)$/);
      if (!match) {
        throw new Error(
          'Formato de imagem inválido (esperado data URL base64)',
        );
      }

      const mimeType = match[1];
      const extension = match[2];
      const base64Data = match[3];

      // Valida formato suportado
      const allowedFormats = ['webp', 'jpeg', 'jpg', 'png'];
      if (!allowedFormats.includes(extension)) {
        throw new Error(
          `Formato de imagem não suportado: ${extension}. Formatos aceitos: ${allowedFormats.join(', ')}`,
        );
      }

      const buffer = Buffer.from(base64Data, 'base64');

      // Gera nome baseado no timestamp
      const timestamp = Date.now();
      const originalName = `image_${timestamp}.${extension}`;

      return {
        buffer,
        extension,
        mimeType,
        originalName,
      };
    } catch (error) {
      this.logger.error(`Erro ao processar imagem base64: ${error.message}`);
      throw new Error(`Falha no processamento da imagem: ${error.message}`);
    }
  }
}
