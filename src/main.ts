import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SupabaseStorageService } from './infra/services/supabase/supabase-storage.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'https://sistema-inscricao-five.vercel.app',
      'http://localhost:3333',
      'http://localhost:8081',
      'http://172.18.208.1:3333',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  //Teste de conexão com supabase
  const supabase = app.get(SupabaseStorageService);
  await supabase.testConnection();

  const config = new DocumentBuilder()
    .setTitle('Sistema de Inscrição - API')
    .setDescription('Documentação oficial da API de Inscrição')
    .setVersion('1.0')
    .addCookieAuth('authToken')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Interface nativa do Swagger
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('/api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'Sistema de Inscrição - Documentação da API',
      customCss: `
        .topbar { background-color: #2563eb !important; }
        .swagger-ui .topbar a span { color: #fff !important; }
      `,
    });
  }

  // Middlewares
  app.use(bodyParser.json({ limit: '15mb' }));
  app.use(bodyParser.urlencoded({ limit: '15mb', extended: true }));

  // Health check
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'API Inscrição está funcionando corretamente ✅',
      version: '1.0',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      uptime: `${process.uptime().toFixed(2)}s`,
    });
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Inicialização
  const port = Number(process.env.PORT ?? 3000);
  const host =
    process.env.NODE_ENV === 'production'
      ? process.env.APP_URL || 'https://seu-dominio.com'
      : `http://localhost:${port}`;

  await app.listen(port, '0.0.0.0');

  console.log(`Servidor rodando em: ${host}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Documentação Swagger: ${host}/api/docs`);
  }
}

bootstrap();
