import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const logger = new Logger('Worker');

  try {
    logger.log('Iniciando worker...');

    const app = await NestFactory.createApplicationContext(WorkerModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    logger.log('Worker iniciado com sucesso');
    logger.log('Worker está rodando em background');

    // Tratamento de sinais para encerramento graceful
    process.on('SIGINT', async () => {
      logger.log('Recebido SIGINT, encerrando worker...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.log('Recebido SIGTERM, encerrando worker...');
      await app.close();
      process.exit(0);
    });

    // Mantém a aplicação rodando
    // O worker continuará rodando até receber um sinal de encerramento
  } catch (error) {
    logger.error(`Erro ao iniciar worker: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();
