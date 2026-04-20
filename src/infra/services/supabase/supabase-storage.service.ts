import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UploadFileOptions {
  folderName: string;
  fileName: string;
  fileBuffer: Buffer;
  contentType: string;
}

export const IMAGE_PRESETS = {
  thumb: { width: 400, height: 250 },
  medium: { width: 800, height: 500 },
  full: { width: 1920, height: 1080 },
};

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_KEY!;
    this.bucketName = process.env.SUPABASE_BUCKET!;

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Variáveis de ambiente do Supabase não configuradas');
      throw new Error('SUPABASE_URL e SUPABASE_KEY são obrigatórios');
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log('Cliente Supabase inicializado com sucesso');
    } catch (error: any) {
      this.logger.error(
        `Erro ao inicializar cliente Supabase: ${error.message}`,
      );
      throw new Error(`Falha na inicialização do Supabase: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage.listBuckets();

      if (error) {
        throw error;
      }

      this.logger.log('Supabase conectado');
      return true;
    } catch (error: any) {
      this.logger.error(' Falha ao conectar com Supabase: ' + error.message);
      return false;
    }
  }

  /**
   * Faz upload de um arquivo para o Supabase Storage
   * @param options - Opções de upload incluindo pasta, nome do arquivo, buffer e tipo de conteúdo
   * @returns URL pública do arquivo enviado
   */
  async uploadFile(options: UploadFileOptions): Promise<string> {
    try {
      const { folderName, fileName, fileBuffer, contentType } = options;
      const filePath = `${folderName}/${fileName}`;

      // Validações de entrada
      if (!folderName || !fileName || !fileBuffer || !contentType) {
        throw new Error('Todos os parâmetros de upload são obrigatórios');
      }

      if (fileBuffer.length === 0) {
        throw new Error('Arquivo não pode estar vazio');
      }

      // Limite de 1MB para upload (considerando que temos apenas 50MB total no Supabase)
      const maxFileSize = 1 * 1024 * 1024; // 1MB
      if (fileBuffer.length > maxFileSize) {
        throw new Error(
          `Arquivo muito grande: ${fileBuffer.length} bytes (máximo: ${maxFileSize} bytes)`,
        );
      }

      this.logger.log(
        `Iniciando upload do arquivo: ${filePath} (${fileBuffer.length} bytes)`,
      );

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (error) {
        this.logger.error(`Erro no upload: ${error.message}`);
        throw new Error(`Falha no upload do arquivo: ${error.message}`);
      }

      this.logger.log(`Upload concluído com sucesso: ${filePath}`);

      // Retorna apenas o caminho do arquivo para salvar no banco
      return filePath;
    } catch (error: any) {
      this.logger.error(`Erro no upload do arquivo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove um arquivo do Supabase Storage
   * @param filePath - Caminho completo do arquivo (ex: "events/nome_arquivo.webp")
   */
  async deleteFile(filePath: string | undefined): Promise<void> {
    try {
      if (!filePath || filePath.trim().length === 0) {
        throw new Error('Caminho do arquivo é obrigatório');
      }

      this.logger.log(`Iniciando exclusão do arquivo: ${filePath}`);

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        this.logger.error(`Erro na exclusão: ${error.message}`);
        throw new Error(`Falha na exclusão do arquivo: ${error.message}`);
      }

      this.logger.log(`Arquivo excluído com sucesso: ${filePath}`);
    } catch (error: any) {
      this.logger.error(`Erro na exclusão do arquivo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém a URL pública de um arquivo
   * @param fileName - Nome do arquivo
   * @param options - Opções de transformação de imagem (width, height, quality)
   *                  ou um preset pré-definido (ex: IMAGE_PRESETS.thumb, IMAGE_PRESETS.medium, IMAGE_PRESETS.full)
   * @param quality - Qualidade da imagem (1-100)
   * @returns URL pública do arquivo
   */
  async getPublicUrl(
    fileName: string,
    options?: {
      width?: number;
      height?: number;
    },
    quality?: number,
  ): Promise<string> {
    try {
      const { data } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(fileName, 60 * 60 * 7, {
          transform: {
            width: options?.width || 1920,
            height: options?.height || 1080,
            quality: quality || 100,
          },
        });

      if (!data?.signedUrl) {
        throw new Error('Não foi possível obter a URL pública do arquivo');
      }

      return data.signedUrl;
    } catch (error: any) {
      console.log(error);
      this.logger.error(`Erro ao obter URL pública: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista arquivos em uma pasta específica
   * @param folderName - Nome da pasta
   * @returns Lista de arquivos na pasta
   */
  async listFiles(folderName: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(folderName);

      if (error) {
        this.logger.error(`Erro ao listar arquivos: ${error.message}`);
        throw new Error(`Falha ao listar arquivos: ${error.message}`);
      }

      return data?.map((file) => file.name) || [];
    } catch (error: any) {
      this.logger.error(`Erro ao listar arquivos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calcula o tamanho total dos arquivos em uma pasta
   * @param folderName - Nome da pasta
   * @returns Tamanho total em bytes
   */
  async calculateFolderSize(folderName: string): Promise<number> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(folderName);

      if (error) {
        this.logger.error(
          `Erro ao calcular tamanho da pasta: ${error.message}`,
        );
        throw new Error(`Falha ao calcular tamanho da pasta: ${error.message}`);
      }

      const totalSize =
        data?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0;

      this.logger.log(
        `Tamanho total da pasta ${folderName}: ${totalSize} bytes (${(totalSize / 1024 / 1024).toFixed(2)} MB)`,
      );

      // Aviso se estiver próximo do limite de 50MB
      const maxStorage = 50 * 1024 * 1024; // 50MB
      const usagePercentage = (totalSize / maxStorage) * 100;

      if (usagePercentage > 80) {
        this.logger.warn(
          `⚠️  ATENÇÃO: Uso do armazenamento em ${usagePercentage.toFixed(1)}% (${(totalSize / 1024 / 1024).toFixed(2)}MB de 50MB)`,
        );
      } else if (usagePercentage > 60) {
        this.logger.warn(
          `⚠️  Armazenamento em ${usagePercentage.toFixed(1)}% (${(totalSize / 1024 / 1024).toFixed(2)}MB de 50MB)`,
        );
      }

      return totalSize;
    } catch (error: any) {
      this.logger.error(`Erro ao calcular tamanho da pasta: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retorna o total de uso do storage
   * @returns Lista de buckets com o uso do storage
   */
  async getStorageUsage(): Promise<
    { bucket_id: string; total_size_mb: number }[]
  > {
    try {
      const { data, error } = await this.supabase.rpc('get_storage_usage');

      if (error) {
        this.logger.error(`Erro ao buscar uso do storage: ${error.message}`);
        throw new Error(`Falha ao buscar uso do storage: ${error.message}`);
      }

      const maxStorage = 50; // MB (seu limite atual)

      data.forEach((bucket) => {
        const usagePercent = (
          (bucket.total_size_mb / maxStorage) *
          100
        ).toFixed(1);
        this.logger.log(
          `📦 Bucket "${bucket.bucket_id}": ${bucket.total_size_mb} MB de ${maxStorage} MB (${usagePercent}%)`,
        );
      });

      return data;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar uso do storage: ${error.message}`);
      throw error;
    }
  }
}
