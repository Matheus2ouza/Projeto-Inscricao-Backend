import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateRegionUseCase } from 'src/usecases/region/create/create-region.usecase';
import { CreateRegionDto } from './create-region.dto';
import { CreateRegionPresenter } from './create-region.presenter';
import { AuthGuard } from 'src/infra/web/authenticator/guards/auth.guard';
import { RoleGuard } from 'src/infra/web/authenticator/guards/role.guard';
import { UserRole } from 'src/infra/web/authenticator/decorators/user-role.decorator';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';

@Controller('regions')
export class CreateRegionRoute {
  constructor(private readonly createRegionUseCase: CreateRegionUseCase) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles('SUPER')
  @Post('create')
  async create(@Body() dto: CreateRegionDto, @UserRole() user: any) {
    // id, createdAt, updatedAt gerados aqui
    const now = new Date();
    const region = await this.createRegionUseCase.execute({
      id: crypto.randomUUID(),
      name: dto.name,
      createdAt: now,
      updatedAt: now,
    });
    return new CreateRegionPresenter(region);
  }
}
