import { Module } from '@nestjs/common';
import { WebMoudule } from './infra/web/web.module';

@Module({
  imports: [WebMoudule],
  controllers: [],
  providers: [],
})
export class AppModule {}
