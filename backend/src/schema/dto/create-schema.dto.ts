import { IsString, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class ColumnDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsBoolean()
  isPrimaryKey: boolean;

  @IsBoolean()
  isUnique: boolean;

  @IsBoolean()
  isNotNull: boolean;
}

export class CreateSchemaDto {
  @IsString()
  tableName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnDto)
  columns: ColumnDto[];
}
