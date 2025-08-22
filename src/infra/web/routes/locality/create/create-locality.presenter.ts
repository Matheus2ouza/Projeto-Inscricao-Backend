import { CreateLocalityOutput } from "src/usecases/locality/create/create-locality.usecase";
import { CreateLocalityRouteResponse } from "./create-locality.dto";

export class CreateLocalityPresenter {
  public static toHttp(input: CreateLocalityOutput): CreateLocalityRouteResponse{
    const response: CreateLocalityRouteResponse = {
      id: input.id
    }
    return response
  }
}