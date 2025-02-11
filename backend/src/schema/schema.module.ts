import { Module } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { SchemaController } from './schema.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schema } from './entities/schema.entity';
import { DynamicSchemaService } from './dynamic-schema.service';

@Module({
  imports: [TypeOrmModule.forFeature([Schema])],
  controllers: [SchemaController],
  providers: [SchemaService, DynamicSchemaService],
})
export class SchemaModule {}
