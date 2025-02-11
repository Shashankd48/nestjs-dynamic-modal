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

  // async insertMany(createRoleDto: CreateRoleDto[]): Promise<Schema[]> {
  //   const role = this.schemaRepository.create(createRoleDto);
  //   return await this.schemaRepository.save(role);
  // }

  // async findAll(): Promise<Schema[]> {
  //   return await this.schemaRepository.find();
  // }

  // async findById(id: string): Promise<Schema | null> {
  //   const role = await this.schemaRepository.findOne({ where: { id } });
  //   return role;
  // }

  // async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Schema> {
  //   const existingRole = await this.findById(id);
  //   const updatedRole = {
  //     ...existingRole,
  //     ...updateRoleDto,
  //   };
  //   return await this.schemaRepository.save(updatedRole);
  // }

  async remove(id: string) {
    return this.schemaRepository.delete({ id });
  }
}
