import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SupabaseStorageService } from './infra/services/supabase/supabase-storage.service';
import { TrimPipe } from './shared/pipes/trim.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Verifica se está no modo evento (com nginx)
  const isEventMode = process.env.EVENT_MODE === 'true';

  if (!isEventMode) {
    // Modo normal: habilita CORS
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://192.168.0.15:3000',
        'http://192.168.0.15',
        'http://192.168.0.15:80',
        'https://sistema-inscricao-five.vercel.app',
        'http://localhost:3333',
        'http://localhost:8081',
        'https://localhost:3333',
        'http://172.18.208.1:3333',
        'http://192.168.1.4',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });
  } else {
    // Modo evento: desabilita CORS completamente (nginx vai lidar com isso)
    app.enableCors({
      origin: false, // Desabilita CORS
    });
    console.log('CORS desabilitado (modo evento - nginx)');
  }

  app.enableShutdownHooks();
  app.use(cookieParser());
  // app.useGlobalInterceptors(app.get(MetricsInterceptor));

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

  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Inicialização
  const port = Number(process.env.PORT ?? 3000);
  const host =
    process.env.NODE_ENV === 'production'
      ? process.env.API_URL || 'https://seu-dominio.com'
      : `http://localhost:${port}`;

  await app.listen(port, '0.0.0.0');

  console.log(`Servidor rodando em: ${host}`);
  isEventMode && console.log(`Modo: EVENT (com nginx)`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Documentação Swagger: ${host}/api/docs`);
  }
}

bootstrap();
