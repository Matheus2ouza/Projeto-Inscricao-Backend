import { Controller, Get } from '@nestjs/common';
import { IsPublic } from '../authenticator/decorators/is-public.decorator';

@Controller()
export class WelcomeRoute {
  @IsPublic()
  @Get()
  healthCheck() {
    return {
      status: 'success',
      message: 'API Inscrição está funcionando corretamente ✅',
      container: process.env.CONTAINER_NAME || 'unknown',
      version: '1.0',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      uptime: `${process.uptime().toFixed(2)}s`,
    };
  }

  @IsPublic()
  @Get('welcome')
  welcome() {
    const name = process.env.CONTAINER_NAME || 'unknown';
    return { message: `Welcome from ${name}` };
  }
}
