import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HealthController } from './health.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ScoreController } from './score/score.controller';
import { ScoreService } from './score/score.service';
import { ItWorkspaceController } from './it-workspace/it-workspace.controller';
import { ItWorkspaceService } from './it-workspace/it-workspace.service';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { DatabaseService } from './database/database.service';
import { ReleasesController } from './releases/releases.controller';
import { ReleasesService } from './releases/releases.service';
import { QaChecksController } from './qa_checks/qa_checks.controller';
import { QaChecksService } from './qa_checks/qa_checks.service';
import { WorkItemsController } from './work_items/work_items.controller';
import { WorkItemsService } from './work_items/work_items.service';
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [
    HealthController,
    AuthController,
    ScoreController,
    ItWorkspaceController,
    WorkItemsController,
    ReleasesController,
    QaChecksController,
  ],
  providers: [
    AuthService,
    ScoreService,
    ItWorkspaceService,
    WorkItemsService,
    DatabaseService,
    ReleasesService,
    QaChecksService,
    JwtAuthGuard,
  ],
})
export class AppModule {}
