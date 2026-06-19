import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { ReleaseResponseDto } from './dto/release-response.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@Injectable()
export class ReleasesService {
  constructor(private readonly db: DatabaseService) {}

  async list() {
    const result = await this.db.query(`
      select
        r.*,
        coalesce(json_agg(rwi.work_item_id) filter (where rwi.work_item_id is not null), '[]') as linked_work_item_ids
      from releases r
      left join release_work_items rwi on rwi.release_id = r.id
      group by r.id
      order by r.created_at desc
    `);

    return result.rows.map((release) => ReleaseResponseDto.fromRow(release));
  }

  async getOne(id: string) {
    const result = await this.db.query(
      `
        select
          r.*,
          coalesce(json_agg(rwi.work_item_id) filter (where rwi.work_item_id is not null), '[]') as linked_work_item_ids
        from releases r
        left join release_work_items rwi on rwi.release_id = r.id
        where r.id = $1
        group by r.id
      `,
      [id],
    );

    if (!result.rows[0]) {
      throw new NotFoundException('Release not found');
    }

    return ReleaseResponseDto.fromRow(result.rows[0]);
  }

  async create(body: CreateReleaseDto) {
    const id = `rel_${Date.now()}`;
    const linkedWorkItemIds = body.linkedWorkItemIds ?? [];

    return this.db.transaction(async (client) => {
      await this.assertWorkItemsReady(linkedWorkItemIds);

      const releaseResult = await client.query(
        `
          insert into releases (id, version, release_date, summary, deployment_status)
          values ($1, $2, $3, $4, $5)
          returning *
        `,
        [id, body.version, body.releaseDate, body.summary, body.deploymentStatus],
      );

      for (const workItemId of linkedWorkItemIds) {
        await client.query(
          `insert into release_work_items (release_id, work_item_id) values ($1, $2)`,
          [id, workItemId],
        );
      }

      return ReleaseResponseDto.fromRow({
        ...releaseResult.rows[0],
        linked_work_item_ids: linkedWorkItemIds,
      });
    });
  }

  async update(id: string, body: UpdateReleaseDto) {
    const current = await this.getOne(id);
    const linkedWorkItemIds = body.linkedWorkItemIds;

    return this.db.transaction(async (client) => {
      if (linkedWorkItemIds) {
        await this.assertWorkItemsReady(linkedWorkItemIds);
      }

      const releaseResult = await client.query(
        `
          update releases
          set
            version = $2,
            release_date = $3,
            summary = $4,
            deployment_status = $5,
            updated_at = now()
          where id = $1
          returning *
        `,
        [
          id,
          body.version ?? current.version,
          body.releaseDate ?? current.releaseDate,
          body.summary ?? current.summary,
          body.deploymentStatus ?? current.deploymentStatus,
        ],
      );

      if (!releaseResult.rows[0]) {
        throw new NotFoundException('Release not found');
      }

      if (linkedWorkItemIds) {
        await client.query(`delete from release_work_items where release_id = $1`, [id]);

        for (const workItemId of linkedWorkItemIds) {
          await client.query(
            `insert into release_work_items (release_id, work_item_id) values ($1, $2)`,
            [id, workItemId],
          );
        }
      }

      return ReleaseResponseDto.fromRow({
        ...releaseResult.rows[0],
        linked_work_item_ids: linkedWorkItemIds ?? current.linkedWorkItemIds,
      });
    });
  }

  async deploy(id: string) {
    const current = await this.getOne(id);

    if (current.deploymentStatus === 'deployed') {
      throw new ConflictException('Release has already been deployed');
    }

    if (!current.linkedWorkItemIds.length) {
      throw new BadRequestException('Release must include at least one work item');
    }

    return this.db.transaction(async (client) => {
      const releaseResult = await client.query(
        `
          update releases
          set deployment_status = 'deployed', updated_at = now()
          where id = $1
          returning *
        `,
        [id],
      );

      await client.query(
        `
          update work_items
          set status = 'released', updated_at = now()
          where id = any($1::text[])
        `,
        [current.linkedWorkItemIds],
      );

      return ReleaseResponseDto.fromRow({
        ...releaseResult.rows[0],
        linked_work_item_ids: current.linkedWorkItemIds,
      });
    });
  }

  async remove(id: string) {
    const result = await this.db.query(`delete from releases where id = $1 returning id`, [id]);

    if (!result.rows[0]) {
      throw new NotFoundException('Release not found');
    }

    return { ok: true };
  }

  private async assertWorkItemsReady(workItemIds: string[]) {
    if (!workItemIds.length) return;

    const result = await this.db.query(
      `
        select id, status
        from work_items
        where id = any($1::text[])
      `,
      [workItemIds],
    );

    if (result.rows.length !== workItemIds.length) {
      throw new BadRequestException('One or more linked work items do not exist');
    }

    const notReady = result.rows.filter((workItem) => workItem.status !== 'ready_for_release');

    if (notReady.length) {
      throw new BadRequestException('Only ready_for_release work items can be linked to a release');
    }
  }
}
