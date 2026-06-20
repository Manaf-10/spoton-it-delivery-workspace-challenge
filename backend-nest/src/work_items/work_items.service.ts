import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { RequestUser } from '../common/request-user';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { UpdateWorkItemDto } from './dto/update-work-item.dto';
import { WorkItemResponseDto } from './dto/work-item-response.dto';

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  backlog: ['planned'],
  planned: ['in_progress'],
  in_progress: ['qa'],
  qa: ['in_progress', 'ready_for_release'],
  ready_for_release: ['qa', 'released'],
  released: [],
};

@Injectable()
export class WorkItemsService {
  constructor(private readonly db: DatabaseService) {}

  async list(filters: { status?: string; priority?: string; assignee?: string; search?: string }) {
    const conditions: string[] = [];
    const params: string[] = [];

    if (filters.status) {
      params.push(filters.status);
      conditions.push(`status = $${params.length}`);
    }

    if (filters.priority) {
      params.push(filters.priority);
      conditions.push(`priority = $${params.length}`);
    }

    if (filters.assignee) {
      params.push(filters.assignee);
      conditions.push(`assignee = $${params.length}`);
    }

    if (filters.search) {
      params.push(`%${filters.search}%`);
      conditions.push(`(title ilike $${params.length} or description ilike $${params.length})`);
    }

    const whereClause = conditions.length ? `where ${conditions.join(' and ')}` : '';

    const result = await this.db.query(
      `
        select *
        from work_items
        ${whereClause}
        order by created_at desc
      `,
      params,
    );

    return result.rows.map((workItem) => WorkItemResponseDto.fromRow(workItem));
  }

  async getOne(id: string) {
    const result = await this.db.query(
      `select * from work_items where id = $1`,
      [id],
    );

    if (!result.rows[0]) {
      throw new NotFoundException('Work item not found');
    }

    return WorkItemResponseDto.fromRow(result.rows[0]);
  }

  async create(user: RequestUser, body: CreateWorkItemDto) {
    const id = `wi_${Date.now()}`;

    const result = await this.db.query(
      `insert into work_items
        (id, title, description, type, status, priority, assignee, due_date, created_by)
       values
        ($1, $2, $3, $4, 'backlog', $5, $6, $7, $8)
       returning *`,
      [
        id,
        body.title,
        body.description,
        body.type,
        body.priority,
        body.assignee,
        body.dueDate ?? null,
        user.id,
      ],
    );

    return WorkItemResponseDto.fromRow(result.rows[0]);
  }

  async update(id: string, body: UpdateWorkItemDto) {
    const current = await this.getOne(id);

    if (body.status && body.status !== current.status) {
      this.assertValidStatusTransition(current.status, body.status);

      if (body.status === 'ready_for_release') {
        await this.assertReadyForRelease(id);
      }
    }

    const result = await this.db.query(
      `
        update work_items
        set
          title = $2,
          description = $3,
          type = $4,
          status = $5,
          priority = $6,
          assignee = $7,
          due_date = $8,
          updated_at = now()
        where id = $1
        returning *
      `,
      [
        id,
        body.title ?? current.title,
        body.description ?? current.description,
        body.type ?? current.type,
        body.status ?? current.status,
        body.priority ?? current.priority,
        body.assignee ?? current.assignee,
        body.dueDate ?? current.dueDate,
      ],
    );

    if (!result.rows[0]) {
      throw new NotFoundException('Work item not found');
    }

    return WorkItemResponseDto.fromRow(result.rows[0]);
  }

  async remove(id: string) {
    const result = await this.db.query(`delete from work_items where id = $1 returning id`, [id]);

    if (!result.rows[0]) {
      throw new NotFoundException('Work item not found');
    }

    return { ok: true };
  }

  private assertValidStatusTransition(currentStatus: string, nextStatus: string) {
    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? [];

    if (!allowedNextStatuses.includes(nextStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${nextStatus}`);
    }
  }

  private async assertReadyForRelease(workItemId: string) {
    const result = await this.db.query(
      `
        select
          count(*)::int as total,
          count(*) filter (where status = 'passed')::int as passed
        from qa_checks
        where work_item_id = $1
      `,
      [workItemId],
    );

    const total = Number(result.rows[0]?.total ?? 0);
    const passed = Number(result.rows[0]?.passed ?? 0);

    if (total === 0) {
      throw new BadRequestException('At least one QA check is required before ready_for_release');
    }

    if (passed !== total) {
      throw new BadRequestException('All QA checks must be passed before ready_for_release');
    }
  }
}
