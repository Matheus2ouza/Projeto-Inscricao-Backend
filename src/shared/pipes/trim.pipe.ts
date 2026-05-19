import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  private trimDeep(value: unknown): unknown {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.trimDeep(item));
    }

    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [
          k,
          this.trimDeep(v),
        ]),
      );
    }

    return value;
  }

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' || metadata.type === 'query') {
      return this.trimDeep(value);
    }
    return value;
  }
}
