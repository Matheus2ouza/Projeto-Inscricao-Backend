import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GroupUploadRoute } from './upload/group-upload.route';
import { GroupConfirmRoute } from './confirm/group-confirm.route';

@ApiTags('Inscription Group')
@Controller('inscriptions/group')
export class InscriptionGroupController {
  constructor(
    private readonly groupUploadRoute: GroupUploadRoute,
    private readonly groupConfirmRoute: GroupConfirmRoute,
  ) {}
}
