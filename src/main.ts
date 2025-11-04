import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'https://sistema-inscricao-five.vercel.app',
      'http://localhost:3333',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

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

  // Inicialização
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Servidor rodando em: http://localhost:${port}`);
  console.log(`Documentação disponível em: http://localhost:${port}/api/docs`);
}

bootstrap();
