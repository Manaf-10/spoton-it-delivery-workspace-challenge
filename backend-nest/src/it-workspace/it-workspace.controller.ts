import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ItWorkspaceService } from './it-workspace.service';

@UseGuards(JwtAuthGuard)
@Controller('it-workspace')
export class ItWorkspaceController {
  constructor(private readonly workspace: ItWorkspaceService) {}

  @Get('summary')
  async summary() {
    return this.workspace.summary();
  }
}
