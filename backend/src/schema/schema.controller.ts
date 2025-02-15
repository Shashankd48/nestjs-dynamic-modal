import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SchemaService } from './schema.service';
import {
  CreateDynamicSchemaDto,
  CreateSchemaDto,
} from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';
import { ApiTags } from '@nestjs/swagger';
import { DynamicSchemaService } from './dynamic-schema.service';

@ApiTags('Schema')
@Controller('schema')
export class SchemaController {
  constructor(
    private readonly schemaService: SchemaService,
    private readonly dynamicSchemaService: DynamicSchemaService,
  ) {}

  @Post()
  async createSchema(@Body() dto: CreateDynamicSchemaDto) {
    // Check if schema exist already
    const foundSchema = await this.schemaService.findOne({
      where: { name: dto.tableName },
    });

    if (foundSchema)
      throw new HttpException('Duplicate table name', HttpStatus.BAD_REQUEST);

    const newTable = await this.dynamicSchemaService.createTable(dto);

    if (newTable.error)
      throw new HttpException(newTable.message, HttpStatus.BAD_REQUEST);

    const schema = await this.schemaService.create({
      name: dto.tableName,
      metadata: JSON.stringify(dto.columns),
    });

    if (!schema)
      throw new HttpException(
        'Failed to save model details',
        HttpStatus.BAD_REQUEST,
      );

    return schema;
  }

  @Get()
  async findAll() {
    return await this.schemaService.find({});
  }

  @Get('data/:tableName')
  async getTableData(
    @Param('tableName') tableName: string,
    @Query('search') search?: string,
    @Query('sortColumn') sortColumn?: string,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const schema = await this.schemaService.findOne({
      where: { name: tableName },
    });

    if (!schema)
      throw new HttpException('Schema not found', HttpStatus.NOT_FOUND);

    let columns: { key: string; label: string }[] = [];
    try {
      const metadata = JSON.parse(schema.metadata);

      if (!metadata || metadata?.length <= 0)
        throw new HttpException('Schema not found', HttpStatus.NOT_FOUND);

      columns = metadata;
    } catch (error) {
      console.error(error);
    }

    const data = await this.dynamicSchemaService.getTableData(
      tableName,
      search,
      sortColumn,
      sortOrder,
      Number(page),
      Number(limit),
    );
    return { data, columns };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const schema = await this.schemaService.findOne({
      where: { id },
    });

    if (!schema)
      throw new HttpException('Table not found', HttpStatus.NOT_FOUND);

    const deleteTable = await this.dynamicSchemaService.deleteTable(
      schema.name,
    );

    if (deleteTable.error)
      throw new HttpException(deleteTable.message, HttpStatus.BAD_REQUEST);

    await this.schemaService.remove(id);

    return deleteTable;
  }
}
