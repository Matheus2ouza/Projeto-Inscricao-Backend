import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable, tap } from 'rxjs';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(
    @InjectMetric('http_request_duration_ms')
    private readonly histogram: Histogram<string>,

    @InjectMetric('http_requests_total')
    private readonly counter: Counter<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method } = req;
    const route: string = req.route?.path ?? req.url;
    const stopTimer = this.histogram.startTimer({ method, route });

    return next.handle().pipe(
      tap({
        next: () => {
          const status_code = String(
            context.switchToHttp().getResponse().statusCode,
          );
          stopTimer({ status_code });
          this.counter.inc({ method, route, status_code });
        },
        error: (err) => {
          const status_code = String(err.status ?? 500);
          stopTimer({ status_code });
          this.counter.inc({ method, route, status_code });
        },
      }),
    );
  }
}
