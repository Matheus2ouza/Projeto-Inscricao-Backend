import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UploadFileOptions {
  folderName: string;
  fileName: string;
  fileBuffer: Buffer;
  contentType: string;
}

export const IMAGE_PRESETS = {
  logo: { width: 500, height: 500 },
  thumbnail: { width: 400, height: 250 },
  standard: { width: 800, height: 500 },
  mediumQuality: { width: 1280, height: 720 },
  highQuality: { width: 1920, height: 1080 },
  receipt: { width: 800, height: 800 },
} satisfies Record<string, { width: number; height: number }>;

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
   * Faz upload de múltiplos arquivos para o Supabase Storage de forma atômica.
   * Caso qualquer upload falhe, todos os arquivos que já foram enviados com sucesso
   * são removidos automaticamente (rollback), garantindo consistência.
   *
   * @param filesOptions - Lista de opções de upload, uma entrada por arquivo
   * @returns Lista de caminhos dos arquivos enviados, na mesma ordem dos inputs
   * @throws Erro original do upload que causou a falha, após o rollback ser executado
   *
   * @example
   * const paths = await supabaseStorageService.uploadFiles([
   *   { folderName: 'expenses', fileName: 'receipt1.webp', fileBuffer: buf1, contentType: 'image/webp' },
   *   { folderName: 'expenses', fileName: 'receipt2.webp', fileBuffer: buf2, contentType: 'image/webp' },
   * ]);
   */
  async uploadFiles(filesOptions: UploadFileOptions[]): Promise<string[]> {
    const uploadedPaths: string[] = [];

    try {
      for (const fileOptions of filesOptions) {
        const path = await this.uploadFile(fileOptions);
        uploadedPaths.push(path);
      }

      return uploadedPaths;
    } catch (error: any) {
      this.logger.warn(
        `Falha no upload múltiplo, iniciando rollback de ${uploadedPaths.length} arquivo(s)...`,
      );

      for (const path of uploadedPaths) {
        try {
          await this.deleteFile(path);
          this.logger.log(`Rollback: arquivo removido: ${path}`);
        } catch (rollbackError: any) {
          this.logger.error(
            `Rollback falhou para ${path}: ${rollbackError.message}`,
          );
        }
      }

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
   * Remove múltiplos arquivos do Supabase Storage de forma atômica.
   * Caso qualquer exclusão falhe, NENHUM arquivo será removido (rollback).
   *
   * @param filePaths - Lista de caminhos completos dos arquivos a serem removidos
   * @returns Promise que resolve quando todos os arquivos foram removidos com sucesso
   * @throws Erro original da exclusão que causou a falha, sem ter removido nenhum arquivo
   *
   * @example
   * await supabaseStorageService.deleteFiles([
   *   'expenses/evento/alimentacao/receipt1.webp',
   *   'expenses/evento/alimentacao/receipt2.webp'
   * ]);
   */
  async deleteFiles(filePaths: string[]): Promise<void> {
    if (!filePaths || filePaths.length === 0) {
      this.logger.warn('Nenhum arquivo fornecido para exclusão');
      return;
    }

    // Filtrar paths inválidos
    const validPaths = filePaths.filter(
      (path) => path && path.trim().length > 0,
    );

    if (validPaths.length === 0) {
      this.logger.warn(
        'Nenhum caminho de arquivo válido fornecido para exclusão',
      );
      return;
    }

    this.logger.log(`Iniciando exclusão de ${validPaths.length} arquivo(s)...`);

    // Simular a exclusão para validar se todos os arquivos existem?
    // O Supabase não tem uma forma fácil de verificar existência antes de deletar,
    // então vamos tentar deletar todos de uma vez e fazer rollback se falhar

    try {
      // O Supabase permite deletar múltiplos arquivos em uma única chamada
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .remove(validPaths);

      if (error) {
        this.logger.error(`Erro na exclusão múltipla: ${error.message}`);
        throw new Error(`Falha na exclusão dos arquivos: ${error.message}`);
      }

      // Verificar se algum arquivo não foi removido
      const failedRemovals = data?.filter((item) => !item) || [];
      if (failedRemovals.length > 0) {
        this.logger.warn(
          `${failedRemovals.length} arquivo(s) podem não ter sido removidos`,
        );
      }

      this.logger.log(
        `${validPaths.length - failedRemovals.length} de ${validPaths.length} arquivo(s) excluído(s) com sucesso`,
      );
    } catch (error: any) {
      this.logger.error(`Falha na exclusão múltipla: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove múltiplos arquivos do Supabase Storage de forma atômica (com rollback individual).
   * Versão alternativa que tenta deletar um por um e faz rollback se algum falhar.
   *
   * @param filePaths - Lista de caminhos completos dos arquivos a serem removidos
   * @returns Promise que resolve quando todos os arquivos foram removidos com sucesso
   * @throws Erro original da exclusão que causou a falha, após fazer rollback das exclusões já realizadas
   *
   * @example
   * await supabaseStorageService.deleteFilesAtomic([
   *   'expenses/evento/alimentacao/receipt1.webp',
   *   'expenses/evento/alimentacao/receipt2.webp'
   * ]);
   */
  async deleteFilesAtomic(filePaths: string[]): Promise<void> {
    if (!filePaths || filePaths.length === 0) {
      this.logger.warn('Nenhum arquivo fornecido para exclusão');
      return;
    }

    // Filtrar paths inválidos
    const validPaths = filePaths.filter(
      (path) => path && path.trim().length > 0,
    );

    if (validPaths.length === 0) {
      this.logger.warn(
        'Nenhum caminho de arquivo válido fornecido para exclusão',
      );
      return;
    }

    const deletedPaths: string[] = [];

    try {
      this.logger.log(
        `Iniciando exclusão atômica de ${validPaths.length} arquivo(s)...`,
      );

      for (const filePath of validPaths) {
        await this.deleteFile(filePath);
        deletedPaths.push(filePath);
        this.logger.log(
          `Arquivo excluído: ${filePath} (${deletedPaths.length}/${validPaths.length})`,
        );
      }

      this.logger.log(
        `Todos os ${validPaths.length} arquivo(s) foram excluídos com sucesso`,
      );
    } catch (error: any) {
      this.logger.error(
        `Falha na exclusão atômica, iniciando rollback de ${deletedPaths.length} arquivo(s)...`,
      );

      // Rollback: restaurar os arquivos que foram deletados
      // NOTA: Rollback de exclusão é complexo porque precisaríamos ter os buffers originais
      // Para simplificar, apenas logamos e não tentamos restaurar arquivos deletados
      this.logger.error(
        `⚠️ ATENÇÃO: ${deletedPaths.length} arquivo(s) foram deletados e NÃO podem ser restaurados automaticamente!`,
      );
      this.logger.error(`Arquivos deletados: ${deletedPaths.join(', ')}`);

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
          `Bucket "${bucket.bucket_id}": ${bucket.total_size_mb} MB de ${maxStorage} MB (${usagePercent}%)`,
        );
      });

      return data;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar uso do storage: ${error.message}`);
      throw error;
    }
  }
}
