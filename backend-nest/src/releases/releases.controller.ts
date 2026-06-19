import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { ReleasesService } from './releases.service';

@UseGuards(JwtAuthGuard)
@Controller('releases')
export class ReleasesController {
  constructor(private readonly releases: ReleasesService) {}

  @Get()
  list() {
    return this.releases.list();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.releases.getOne(id);
  }

  @Post()
  create(@Body() body: CreateReleaseDto) {
    return this.releases.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateReleaseDto) {
    return this.releases.update(id, body);
  }

  @Post(':id/deploy')
  deploy(@Param('id') id: string) {
    return this.releases.deploy(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.releases.remove(id);
  }
}
