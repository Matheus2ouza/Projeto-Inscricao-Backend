import { Module } from "@nestjs/common";
import { CreateLocalityRoute } from "./routes/locality/create/create-locality.route";
import { UsecaseModule } from "src/usecases/usecase.module";

@Module({
  imports: [UsecaseModule],
  controllers: [CreateLocalityRoute],
})
export class WebMoudule {}
