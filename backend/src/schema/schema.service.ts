import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateSchemaDto } from './dto/create-schema.dto';

@Injectable()
export class SchemaService {
  constructor(private readonly dataSource: DataSource) {}

  async createTable(dto: CreateSchemaDto) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const columnDefinitions = dto.columns
        .map((col) => {
          let definition = `${col.name} ${col.type}`;
          if (col.isPrimaryKey) definition += ' PRIMARY KEY';
          if (col.isUnique) definition += ' UNIQUE';
          if (col.isNotNull) definition += ' NOT NULL';
          return definition;
        })
        .join(', ');

      const query = `CREATE TABLE IF NOT EXISTS ${dto.tableName} (${columnDefinitions});`;

      await queryRunner.query(query);
      await queryRunner.release();

      return { message: `Table ${dto.tableName} created successfully.` };
    } catch (error) {
      return error;
    }
  }
}
