export class ReleaseResponseDto {
  id!: string;
  version!: string;
  releaseDate!: string;
  summary!: string;
  deploymentStatus!: string;
  linkedWorkItemIds!: string[];
  createdAt!: string;
  updatedAt!: string;

  static fromRow(row: Record<string, any>): ReleaseResponseDto {
    return {
      id: row.id,
      version: row.version,
      releaseDate: row.release_date,
      summary: row.summary,
      deploymentStatus: row.deployment_status,
      linkedWorkItemIds: row.linked_work_item_ids ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
