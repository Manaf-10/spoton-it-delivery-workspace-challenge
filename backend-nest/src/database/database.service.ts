import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/spoton_challenge',
  });

  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async initSchema() {
    const schemaPath = join(process.cwd(), 'src', 'database', 'schema.sql');
    const schema = await readFile(schemaPath, 'utf8');
    await this.query(schema);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
