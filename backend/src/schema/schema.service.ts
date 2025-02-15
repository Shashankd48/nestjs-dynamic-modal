import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Schema } from './entities/schema.entity';
import { CreateSchemaDto } from './dto/create-schema.dto';

@Injectable()
export class SchemaService {
  constructor(
    @InjectRepository(Schema)
    private readonly schemaRepository: Repository<Schema>,
  ) {}

  async create(createRoleDto: CreateSchemaDto): Promise<Schema> {
    const schema = this.schemaRepository.create(createRoleDto);
    return this.schemaRepository.save(schema);
  }

  async findOne(options: FindOneOptions<Schema>): Promise<Schema> {
    return this.schemaRepository.findOne(options);
  }

  async find(options: FindManyOptions<Schema>): Promise<Schema[]> {
    return this.schemaRepository.find(options);
  }

  async remove(id: string) {
    return this.schemaRepository.delete({ id });
  }
}
