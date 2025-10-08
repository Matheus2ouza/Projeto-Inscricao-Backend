import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // Swagger config com autenticação por cookie
  const config = new DocumentBuilder()
    .setTitle('API Inscrição')
    .setDescription('Documentação da API de Inscrição')
    .setVersion('1.0')
    .addCookieAuth('authToken')
    .addCookieAuth('refreshToken')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(bodyParser.json({ limit: '6mb' }));
  app.use(bodyParser.urlencoded({ limit: '6mb', extended: true }));

  // Rota GET / para teste mais rebuscada
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'API Inscrição está funcionando corretamente ✅',
      version: '1.0',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime().toFixed(2) + 's',
    });
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
