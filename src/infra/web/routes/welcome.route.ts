import { Controller, Get } from '@nestjs/common';
import { IsPublic } from '../authenticator/decorators/is-public.decorator';

@Controller()
export class WelcomeRoute {
  @IsPublic()
  @Get('welcome')
  welcome() {
    const name = process.env.CONTAINER_NAME || 'unknown';
    return { message: `Welcome from ${name}` };
  }
}
