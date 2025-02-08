import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SchemaService } from './schema.service';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Schema')
@Controller('schema')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Post('')
  async createSchema(@Body() dto: CreateSchemaDto) {
    return this.schemaService.createTable(dto);
  }

  @Get('')
  async findAll() {
    return 'Hello';
  }
}
