import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CreateDynamicSchemaDto,
  CreateSchemaDto,
} from './dto/create-schema.dto';

@Injectable()
export class DynamicSchemaService {
  constructor(private readonly dataSource: DataSource) {}

  private async getQueryRunner() {
    const queryRunner = this.dataSource.createQueryRunner();
    return queryRunner.connect();
  }

  async createTable(dto: CreateDynamicSchemaDto) {
    try {
      const queryRunner = await this.getQueryRunner();

      // Define default system columns (id, createdAt, updatedAt)
      const systemColumns = [
        `"id" UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
        `"createdAt" TIMESTAMP DEFAULT NOW()`,
        `"updatedAt" TIMESTAMP DEFAULT NOW()`,
      ];

      // Generate column definitions from DTO while preserving case sensitivity
      const columnDefinitions = dto.columns.map((col) => {
        let definition = `"${col.name}" ${col.type}`; // Preserve case sensitivity

        if (col.isPrimaryKey) definition += ' PRIMARY KEY';
        if (col.isUnique) definition += ' UNIQUE';
        if (col.isNotNull) definition += ' NOT NULL';

        return definition;
      });

      // Combine system columns with user-defined columns
      const allColumns = [...systemColumns, ...columnDefinitions].join(', ');

      // Final SQL query
      const query = `CREATE TABLE IF NOT EXISTS "${dto.tableName}" (${allColumns});`;

      await queryRunner.query(query);
      await queryRunner.release();

      return {
        message: `Table "${dto.tableName}" created successfully.`,
        error: false,
      };
    } catch (error: any) {
      console.error(error);
      return {
        message: error.message,
        error: true,
      };
    }
  }

  async getTableData(
    tableName: string,
    searchQuery?: string,
    sortColumn?: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      // Validate table name to allow only letters, numbers, and underscores
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
        throw new Error('Invalid table name');
      }

      // Validate sort column if provided
      if (sortColumn && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sortColumn)) {
        throw new Error('Invalid sort column');
      }

      // Optional: Sanitize searchQuery further if you plan to allow it as a raw SQL fragment.
      // For example, reject dangerous keywords or characters.
      if (
        searchQuery &&
        /;|--|\b(drop|delete|insert|update)\b/i.test(searchQuery)
      ) {
        throw new Error('Invalid search query');
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build the query using the validated table and column names.
      // We quote the table and column names to avoid conflicts with reserved keywords.
      let query = `SELECT * FROM "${tableName}"`;

      if (searchQuery) {
        // Since searchQuery is provided as a raw fragment, ensure it is safe
        query += ` WHERE ${searchQuery}`;
      }

      if (sortColumn) {
        query += ` ORDER BY "${sortColumn}" ${sortOrder}`;
      }

      // Parameterize LIMIT and OFFSET to prevent injection
      query += ` LIMIT $1 OFFSET $2`;

      return await this.dataSource.query(query, [limit, offset]);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteTable(tableName: string) {
    try {
      // Validate table name to prevent SQL injection
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
        throw new BadRequestException('Invalid table name');
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      try {
        // Check if the table exists in PostgreSQL
        const result = await queryRunner.query(
          `SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = $1
          ) AS "exists";`,
          [tableName],
        );

        if (!result[0]?.exists) {
          throw new BadRequestException(`Table "${tableName}" does not exist.`);
        }

        // Drop the table safely
        await queryRunner.query(`DROP TABLE "${tableName}" CASCADE`);

        return {
          message: `Table "${tableName}" deleted successfully.`,
          error: false,
        };
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      return {
        message: error.message,
        error: true,
      };
    }
  }

  async insertData(tableName: string, data: Record<string, any>) {
    try {
      const result = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(tableName)
        .values(data)
        .returning('*') // Return all columns after insertion
        .execute();

      // Ensure the inserted data is returned
      return {
        error: '',
        data: result.raw[0], // `result.raw` contains the inserted row(s)
      };
    } catch (error) {
      return {
        error: error.message,
        data: null,
      };
    }
  }

  async updateData(tableName: string, id: string, data: Record<string, any>) {
    return await this.dataSource
      .createQueryBuilder()
      .update(tableName)
      .set(data)
      .where('id = :id', { id })
      .execute();
  }

  async deleteData(tableName: string, id: string): Promise<any> {
    // Validate UUID format for id
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Validate and sanitize table name
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      throw new BadRequestException('Invalid table name');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Use safe query execution
      const deletedRecord = await queryRunner.query(
        `DELETE FROM "${tableName}" WHERE id = $1 RETURNING *;`,
        [id],
      );

      if (!deletedRecord.length) {
        throw new NotFoundException(`Record not found in table: ${tableName}`);
      }

      await queryRunner.commitTransaction();
      return deletedRecord[0]; // Return deleted record
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting record:', error);
      throw new HttpException(
        'Failed to delete record',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
