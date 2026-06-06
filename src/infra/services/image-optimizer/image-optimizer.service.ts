import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'png';
  maxFileSize?: number; // em bytes
}

export interface OptimizedImageResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

// Presets de otimização
export const IMAGE_OPTIMIZATION_PRESETS = {
  thumbnail: {
    // era: thumb
    maxWidth: 400,
    maxHeight: 250,
    quality: 60,
    format: 'webp' as const,
    maxFileSize: 50 * 1024,
  },
  standard: {
    // era: medium
    maxWidth: 800,
    maxHeight: 500,
    quality: 70,
    format: 'webp' as const,
    maxFileSize: 150 * 1024,
  },
  highQuality: {
    // era: full
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
    format: 'webp' as const,
    maxFileSize: 500 * 1024,
  },
  receipt: {
    // era: expense — mais específico pro domínio
    maxWidth: 800,
    maxHeight: 800,
    quality: 70,
    format: 'webp' as const,
    maxFileSize: 300 * 1024,
  },
} satisfies Record<string, ImageOptimizationOptions>;

export type ImageOptimizationPreset = keyof typeof IMAGE_OPTIMIZATION_PRESETS;

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
      const err = error as Error;
      this.logger.error(`Erro na validação da imagem: ${err.message}`);
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
    options: ImageOptimizationOptions | ImageOptimizationPreset = 'standard',
  ): Promise<OptimizedImageResult> {
    try {
      const resolvedOptions: ImageOptimizationOptions =
        typeof options === 'string'
          ? IMAGE_OPTIMIZATION_PRESETS[options]
          : options;

      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 70,
        format = 'webp',
        maxFileSize = 500 * 1024,
      } = resolvedOptions;

      this.logger.log(
        `Iniciando otimização da imagem (${maxWidth}x${maxHeight}, qualidade inicial: ${quality}, formato: ${format})`,
      );

      // Obtém metadados da imagem original
      const originalMetadata = await sharp(buffer, {
        failOn: 'none',
      }).metadata();
      const originalHasAlpha = Boolean(originalMetadata.hasAlpha);
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
      const isPngOutput = format === 'png';
      const maxAttempts = isPngOutput ? 1 : 8; // PNG preserva transparência, não reduzimos qualidade

      do {
        attempts++;
        this.logger.log(
          `Tentativa ${attempts}: ${
            isPngOutput ? 'compressão sem perda' : `qualidade ${currentQuality}`
          } (formato ${format})`,
        );

        // Configura o Sharp para otimização do formato adequado
        let sharpInstance = sharp(buffer, { failOn: 'none' }).resize(
          maxWidth,
          maxHeight,
          {
            fit: 'inside',
            withoutEnlargement: true,
          },
        );

        if (isPngOutput) {
          // PNG precisa preservar o canal alpha; evitamos reduzir paleta ou mexer em "qualidade"
          sharpInstance = sharpInstance.png({
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: false,
          });
        } else {
          sharpInstance = sharpInstance.webp({
            quality: currentQuality,
            effort: 6,
            lossless: false, // Sempre com perda para menor tamanho
            nearLossless: false, // Desabilita para menor tamanho
          });
        }

        optimizedBuffer = await sharpInstance.toBuffer();

        this.logger.log(
          `Tentativa ${attempts}: ${optimizedBuffer.length} bytes (limite: ${maxFileSize})`,
        );

        // Se atingiu o tamanho desejado ou é a última tentativa, para
        if (optimizedBuffer.length <= maxFileSize || attempts >= maxAttempts) {
          break;
        }

        // Reduz a qualidade de forma mais agressiva
        if (!isPngOutput) {
          if (attempts <= 3) {
            currentQuality = Math.max(30, currentQuality - 20);
          } else {
            currentQuality = Math.max(10, currentQuality - 10);
          }
        }
      } while (attempts < maxAttempts);

      let optimizedMetadata = await sharp(optimizedBuffer).metadata();
      const optimizedHasAlpha = Boolean(optimizedMetadata.hasAlpha);

      if (isPngOutput && originalHasAlpha && !optimizedHasAlpha) {
        this.logger.warn(
          'PNG otimizado perdeu o canal alpha. Aplicando fallback para preservar transparência.',
        );

        const fallbackBuffer = await sharp(buffer)
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png({
            compressionLevel: 6,
            adaptiveFiltering: true,
            palette: false,
            progressive: false,
          })
          .toBuffer();

        const fallbackMetadata = await sharp(fallbackBuffer).metadata();

        if (!fallbackMetadata.hasAlpha) {
          this.logger.warn(
            'Fallback ainda sem alpha. Mantendo buffer original para evitar perda de transparência.',
          );
          optimizedBuffer = buffer;
          optimizedMetadata = originalMetadata;
        } else {
          optimizedBuffer = fallbackBuffer;
          optimizedMetadata = fallbackMetadata;
        }
      }

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
      const err = error as Error;
      this.logger.error(
        `Erro na otimização da imagem: ${err.message}`,
        err.stack,
      );
      this.logger.debug(`Tamanho do buffer: ${buffer.length} bytes`);
      this.logger.debug(`Opções: ${JSON.stringify(options)}`);

      // Tratamento específico para imagens corrompidas/incompletas
      if (
        err.message.includes('Premature end of input file') ||
        err.message.includes('VipsJpeg')
      ) {
        throw new Error(
          'A imagem enviada está corrompida ou incompleta. Por favor, tente enviar novamente ou use outra imagem.',
        );
      }

      throw new Error(`Falha na otimização da imagem: ${err.message}`);
    }
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

      if (!this.supportedFormats.includes(extension)) {
        throw new Error(
          `Formato de imagem não suportado: ${extension}. Formatos aceitos: ${this.supportedFormats.join(', ')}`,
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
      const err = error as Error;
      this.logger.error(`Erro ao processar imagem base64: ${err.message}`);
      throw new Error(`Falha no processamento da imagem: ${err.message}`);
    }
  }

  private readonly mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  getMimeType(format: string): string {
    return this.mimeTypes[format.toLowerCase()] ?? 'image/jpeg';
  }
}
