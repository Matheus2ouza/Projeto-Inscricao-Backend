import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateEventUseCase } from 'src/usecases/event/create/create-event.usecase';
import { CreateEventDto } from './create-event.dto';
import { CreateEventPresenter } from './create-event.presenter';
import { AuthGuard } from 'src/infra/web/authenticator/guards/auth.guard';
import { RoleGuard } from 'src/infra/web/authenticator/guards/role.guard';
import { UserRole } from 'src/infra/web/authenticator/decorators/user-role.decorator';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';

@Controller('event')
export class CreateEventRoute {
  constructor(private readonly createEventUseCase: CreateEventUseCase) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Post('create')
  async create(@Body() dto: CreateEventDto, @UserRole() user: any) {
    // Regra: só ADMIN pode criar, regionId vem do DTO
    const event = await this.createEventUseCase.execute({
      name: dto.name,
      date: new Date(dto.date),
      regionId: dto.regionId,
    });
    return new CreateEventPresenter(event);
  }
}
