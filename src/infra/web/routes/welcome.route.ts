import { Controller, Get } from '@nestjs/common';

@Controller()
export class WelcomeRoute {
  @Get('welcome')
  welcome() {
    const name = process.env.CONTAINER_NAME || 'unknown';
    return { message: `Welcome from ${name}` };
  }
}
