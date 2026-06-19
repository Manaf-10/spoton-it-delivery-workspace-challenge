import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CreateQaCheckDto } from './dto/create-qa-check.dto';
import { UpdateQaCheckDto } from './dto/update-qa-check.dto';
import { QaChecksService } from './qa_checks.service';

@UseGuards(JwtAuthGuard)
@Controller('qa-checks')
export class QaChecksController {
  constructor(private readonly qaChecks: QaChecksService) {}

  @Get()
  list(@Query('workItemId') workItemId?: string, @Query('status') status?: string) {
    return this.qaChecks.list({ workItemId, status });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.qaChecks.getOne(id);
  }

  @Post()
  create(@Body() body: CreateQaCheckDto) {
    return this.qaChecks.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateQaCheckDto) {
    return this.qaChecks.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qaChecks.remove(id);
  }
}
