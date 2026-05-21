import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsInterceptor } from './metrics.interceptor';
import { MetricsPushService } from './metrics.push.service';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
      path: '/metrics',
    }),
  ],
  providers: [
    MetricsInterceptor,
    MetricsPushService,
    makeHistogramProvider({
      name: 'http_request_duration_ms',
      help: 'Duração das requisições HTTP em milissegundos',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [10, 25, 50, 100, 200, 500, 1000, 2000, 5000],
    }),
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total de requisições HTTP',
      labelNames: ['method', 'route', 'status_code'],
    }),
  ],
  exports: [MetricsInterceptor, MetricsPushService],
})
export class MetricsModule {}
