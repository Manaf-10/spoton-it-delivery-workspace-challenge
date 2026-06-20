export class WorkItemResponseDto {
  id!: string;
  title!: string;
  description!: string;
  type!: string;
  status!: string;
  priority!: string;
  assignee!: string;
  dueDate!: string | null;
  createdBy!: string;
  createdAt!: string;
  updatedAt!: string;

  static fromRow(row: Record<string, any>): WorkItemResponseDto {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      status: row.status,
      priority: row.priority,
      assignee: row.assignee,
      dueDate: row.due_date,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
