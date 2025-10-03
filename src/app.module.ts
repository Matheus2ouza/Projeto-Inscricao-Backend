import { Module } from '@nestjs/common';
import { WebModule } from './infra/web/web.module';

@Module({
  imports: [WebModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
