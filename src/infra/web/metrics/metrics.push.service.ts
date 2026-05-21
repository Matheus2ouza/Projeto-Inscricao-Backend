import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { register } from 'prom-client';

@Injectable()
export class MetricsPushService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MetricsPushService.name);

  onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'production') return;

    const url = process.env.GRAFANA_PROMETHEUS_URL;
    const username = process.env.GRAFANA_PROMETHEUS_USERNAME;
    const password = process.env.GRAFANA_PROMETHEUS_PASSWORD;

    if (!url || !username || !password) {
      this.logger.warn(
        'Grafana Cloud não configurado, métricas não serão enviadas',
      );
      return;
    }

    setInterval(async () => {
      try {
        const metrics = await register.metrics();
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          },
          body: metrics,
        });

        this.logger.log(`Métricas enviadas: ${response.status}`); // adiciona isso
      } catch (err) {
        this.logger.error('Erro ao enviar métricas pro Grafana Cloud', err);
      }
    }, 15000);
  }
}
