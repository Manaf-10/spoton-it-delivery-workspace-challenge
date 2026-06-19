import { ArrayNotEmpty, IsArray, IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateReleaseDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  version?: string;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  summary?: string;

  @IsOptional()
  @IsIn(['draft', 'scheduled', 'deployed', 'rolled_back'])
  deploymentStatus?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  linkedWorkItemIds?: string[];
}
