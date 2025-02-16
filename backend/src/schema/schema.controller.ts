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
  Put,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
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

    const systemColumns = [
      {
        isNotNull: false,
        isPrimaryKey: false,
        isUnique: false,
        name: 'createdAt',
        type: 'TIMESTAMP',
      },
      {
        isNotNull: false,
        isPrimaryKey: false,
        isUnique: false,
        name: 'updatedAt',
        type: 'TIMESTAMP',
      },
    ];

    const schema = await this.schemaService.create({
      name: dto.tableName,
      metadata: JSON.stringify([
        {
          isNotNull: false,
          isPrimaryKey: true,
          isUnique: true,
          name: 'id',
          type: 'UUID',
        },
        ...dto.columns,
        ...systemColumns,
      ]),
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

  @Post('data/:tableName')
  async insertData(
    @Param('tableName') tableName: string,
    @Body() data: Record<string, any>,
  ) {
    // Fetch table schema
    const schema = await this.schemaService.findOne({
      where: { name: tableName },
    });

    if (!schema)
      throw new HttpException('Schema not found', HttpStatus.NOT_FOUND);

    let columns: { name: string }[] = [];
    try {
      columns = JSON.parse(schema.metadata);
      if (!columns || columns.length === 0)
        throw new HttpException(
          'Schema metadata is invalid',
          HttpStatus.BAD_REQUEST,
        );
    } catch (error) {
      throw new HttpException(
        'Schema metadata is invalid',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Filter only valid fields from the request body
    const filteredData: Record<string, any> = {};
    columns.forEach((column) => {
      if (column.name in data) {
        filteredData[column.name] = data[column.name];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new HttpException(
        'No valid fields provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Insert data into the dynamic table
    const result = await this.dynamicSchemaService.insertData(
      tableName,
      filteredData,
    );

    if (result.error !== '') throw new BadRequestException(result.error);

    if (!result.data) throw new BadRequestException('Faileed to save record');

    return result.data;
  }

  @Put('data/:tableName/:id')
  async updateData(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @Body() data: Record<string, any>,
  ) {
    // Fetch table schema
    const schema = await this.schemaService.findOne({
      where: { name: tableName },
    });

    if (!schema)
      throw new HttpException('Schema not found', HttpStatus.NOT_FOUND);

    let columns: { name: string; label: string }[] = [];
    try {
      columns = JSON.parse(schema.metadata);
      if (!columns || columns.length === 0)
        throw new HttpException(
          'Schema metadata is invalid',
          HttpStatus.BAD_REQUEST,
        );
    } catch (error) {
      throw new HttpException(
        'Schema metadata is invalid',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Filter only valid fields from the request body
    const filteredData: Record<string, any> = {};
    columns.forEach((column) => {
      if (column.name in data) {
        filteredData[column.name] = data[column.name];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new HttpException(
        'No valid fields provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update the record in the dynamic table
    const result = await this.dynamicSchemaService.updateData(
      tableName,
      id,
      filteredData,
    );
    return { message: 'Record updated successfully', result };
  }

  @Delete('data/:tableName/:id')
  async deleteData(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
  ) {
    // Fetch table schema
    const schema = await this.schemaService.findOne({
      where: { name: tableName },
    });

    if (!schema) throw new NotFoundException('Schema not found');

    try {
      // Attempt to delete the record
      const deletedRecord = await this.dynamicSchemaService.deleteData(
        tableName,
        id,
      );

      if (deletedRecord.length === 0)
        throw new HttpException('Record not found', HttpStatus.NOT_FOUND);

      return {
        message: 'Record deleted successfully',
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
