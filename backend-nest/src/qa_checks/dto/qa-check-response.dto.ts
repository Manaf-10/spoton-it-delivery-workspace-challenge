export class QaCheckResponseDto {
  id!: string;
  workItemId!: string;
  testTitle!: string;
  expectedResult!: string;
  actualResult!: string | null;
  status!: string;
  tester!: string;
  notes!: string | null;
  createdAt!: string;
  updatedAt!: string;

  static fromRow(row: Record<string, any>): QaCheckResponseDto {
    return {
      id: row.id,
      workItemId: row.work_item_id,
      testTitle: row.test_title,
      expectedResult: row.expected_result,
      actualResult: row.actual_result,
      status: row.status,
      tester: row.tester,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
