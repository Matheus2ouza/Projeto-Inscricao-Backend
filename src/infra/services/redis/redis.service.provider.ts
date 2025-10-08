import { Provider } from '@nestjs/common';
import { RedisService } from './redis.service';

export const RedisServiceProvider: Provider = {
  provide: RedisService,
  useClass: RedisService,
};
