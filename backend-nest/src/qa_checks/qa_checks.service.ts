import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateQaCheckDto } from './dto/create-qa-check.dto';
import { QaCheckResponseDto } from './dto/qa-check-response.dto';
import { UpdateQaCheckDto } from './dto/update-qa-check.dto';

@Injectable()
export class QaChecksService {
  constructor(private readonly db: DatabaseService) {}

  async list(filters: { workItemId?: string; status?: string }) {
    const conditions: string[] = [];
    const params: string[] = [];

    if (filters.workItemId) {
      params.push(filters.workItemId);
      conditions.push(`work_item_id = $${params.length}`);
    }

    if (filters.status) {
      params.push(filters.status);
      conditions.push(`status = $${params.length}`);
    }

    const whereClause = conditions.length ? `where ${conditions.join(' and ')}` : '';

    const result = await this.db.query(
      `
        select *
        from qa_checks
        ${whereClause}
        order by created_at desc
      `,
      params,
    );

    return result.rows.map((qaCheck) => QaCheckResponseDto.fromRow(qaCheck));
  }

  async getOne(id: string) {
    const result = await this.db.query(`select * from qa_checks where id = $1`, [id]);

    if (!result.rows[0]) {
      throw new NotFoundException('QA check not found');
    }

    return QaCheckResponseDto.fromRow(result.rows[0]);
  }

  async create(body: CreateQaCheckDto) {
    await this.assertWorkItemExists(body.workItemId);

    const id = `qa_${Date.now()}`;

    const result = await this.db.query(
      `
        insert into qa_checks
          (id, work_item_id, test_title, expected_result, actual_result, status, tester, notes)
        values
          ($1, $2, $3, $4, $5, $6, $7, $8)
        returning *
      `,
      [
        id,
        body.workItemId,
        body.testTitle,
        body.expectedResult,
        body.actualResult ?? null,
        body.status,
        body.tester,
        body.notes ?? null,
      ],
    );

    return QaCheckResponseDto.fromRow(result.rows[0]);
  }

  async update(id: string, body: UpdateQaCheckDto) {
    const current = await this.getOne(id);

    if (body.workItemId) {
      await this.assertWorkItemExists(body.workItemId);
    }

    const result = await this.db.query(
      `
        update qa_checks
        set
          work_item_id = $2,
          test_title = $3,
          expected_result = $4,
          actual_result = $5,
          status = $6,
          tester = $7,
          notes = $8,
          updated_at = now()
        where id = $1
        returning *
      `,
      [
        id,
        body.workItemId ?? current.workItemId,
        body.testTitle ?? current.testTitle,
        body.expectedResult ?? current.expectedResult,
        body.actualResult ?? current.actualResult,
        body.status ?? current.status,
        body.tester ?? current.tester,
        body.notes ?? current.notes,
      ],
    );

    if (!result.rows[0]) {
      throw new NotFoundException('QA check not found');
    }

    return QaCheckResponseDto.fromRow(result.rows[0]);
  }

  async remove(id: string) {
    const result = await this.db.query(`delete from qa_checks where id = $1 returning id`, [id]);

    if (!result.rows[0]) {
      throw new NotFoundException('QA check not found');
    }

    return { ok: true };
  }

  private async assertWorkItemExists(workItemId: string) {
    const result = await this.db.query(`select id from work_items where id = $1`, [workItemId]);

    if (!result.rows[0]) {
      throw new BadRequestException('Work item does not exist');
    }
  }
}
