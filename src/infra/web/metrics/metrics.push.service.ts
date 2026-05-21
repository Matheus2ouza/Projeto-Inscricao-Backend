import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { register } from 'prom-client';
import * as remoteWrite from 'prometheus-remote-write';

@Injectable()
export class MetricsPushService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MetricsPushService.name);

  onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'production') return;

    const url = process.env.GRAFANA_PROMETHEUS_URL;
    const username = process.env.GRAFANA_PROMETHEUS_USERNAME;
    const password = process.env.GRAFANA_PROMETHEUS_PASSWORD;

    if (!url || !username || !password) {
      this.logger.warn('Grafana Cloud não configurado');
      return;
    }

    setInterval(async () => {
      try {
        const metrics = await register.getMetricsAsJSON();

        const payload: Record<string, number> = {};
        for (const metric of metrics) {
          for (const value of metric.values) {
            const labelStr = Object.entries(value.labels)
              .map(([k, v]) => `${k}="${v}"`)
              .join(',');
            const key = labelStr ? `${metric.name}{${labelStr}}` : metric.name;
            payload[key] = value.value as number;
          }
        }

        this.logger.log(
          `Payload size: ${Object.keys(payload).length} métricas`,
        );
        this.logger.log(
          `Sample: ${JSON.stringify(Object.entries(payload).slice(0, 2))}`,
        );

        const response = await remoteWrite.pushMetrics(payload, {
          url,
          auth: { username, password },
        });
        this.logger.log('Métricas enviadas com sucesso', response);
      } catch (err) {
        this.logger.error('Erro ao enviar métricas', err);
      }
    }, 15000);
  }
}
