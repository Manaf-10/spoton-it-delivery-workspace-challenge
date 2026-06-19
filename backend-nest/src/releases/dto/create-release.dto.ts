import { ArrayNotEmpty, IsArray, IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateReleaseDto {
  @IsString()
  @MinLength(2)
  version!: string;

  @IsDateString()
  releaseDate!: string;

  @IsString()
  @MinLength(5)
  summary!: string;

  @IsIn(['draft', 'scheduled', 'deployed', 'rolled_back'])
  deploymentStatus!: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  linkedWorkItemIds?: string[];
}
