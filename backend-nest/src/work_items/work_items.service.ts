import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { RequestUser } from '../common/request-user';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { UpdateWorkItemDto } from './dto/update-work-item.dto';

@Injectable()
export class WorkItemsService {
  constructor(private readonly db: DatabaseService) {}

  async list(filters: { status?: string; priority?: string }) {
    const result = await this.db.query(
      `select * from work_items order by created_at desc`,
    );

    return result.rows;
  }

  async getOne(id: string) {
    const result = await this.db.query(
      `select * from work_items where id = $1`,
      [id],
    );

    if (!result.rows[0]) {
      throw new NotFoundException('Work item not found');
    }

    return result.rows[0];
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

    return result.rows[0];
  }

  async update(id: string, body: UpdateWorkItemDto) {
    //will add workflow validation later.
  }

  async remove(id: string) {
    await this.db.query(`delete from work_items where id = $1`, [id]);
    return { ok: true };
  }
}