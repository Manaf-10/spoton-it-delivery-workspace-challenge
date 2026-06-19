import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { RequestUser } from '../common/request-user';
import { WorkItemsService } from './work_items.service';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { UpdateWorkItemDto } from './dto/update-work-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('work-items')
export class WorkItemsController {
  constructor(private readonly workItems: WorkItemsService) {}

  @Get()
  list(@Query('status') status?: string, @Query('priority') priority?: string) {
    return this.workItems.list({ status, priority });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.workItems.getOne(id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() body: CreateWorkItemDto) {
    return this.workItems.create(user, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateWorkItemDto) {
    return this.workItems.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workItems.remove(id);
  }
}
