import { RouteException } from '../route.exception';

export class RegionIdNotFoundRouteException extends RouteException {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string,
  ) {
    super(internalMessage, publicMessage, context);
    this.name = RegionIdNotFoundRouteException.name;
  }
}
