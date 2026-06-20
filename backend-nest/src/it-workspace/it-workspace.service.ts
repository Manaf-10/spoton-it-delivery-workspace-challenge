import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ItWorkspaceService {
  constructor(private readonly db: DatabaseService) {}

  async summary() {
    const result = await this.db.query<{
      active_work_items: number;
      qa_checks: number;
      ready_work_items: number;
      released_work_items: number;
      releases: number;
      total_work_items: number;
    }>(`
      select
        (select count(*)::int from work_items) as total_work_items,
        (
          select count(*)::int
          from work_items
          where status not in ('ready_for_release', 'released')
        ) as active_work_items,
        (
          select count(*)::int
          from work_items
          where status = 'ready_for_release'
        ) as ready_work_items,
        (
          select count(*)::int
          from work_items
          where status = 'released'
        ) as released_work_items,
        (select count(*)::int from qa_checks) as qa_checks,
        (select count(*)::int from releases) as releases
    `);

    const row = result.rows[0];

    return {
      message: 'IT Delivery Workspace summary loaded.',
      counts: {
        activeWorkItems: Number(row.active_work_items),
        qaChecks: Number(row.qa_checks),
        readyWorkItems: Number(row.ready_work_items),
        releasedWorkItems: Number(row.released_work_items),
        releases: Number(row.releases),
        totalWorkItems: Number(row.total_work_items),
      },
    };
  }
}
