import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWorkItemDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(5)
  description!: string;

  @IsIn(['feature', 'bug', 'improvement', 'maintenance'])
  type!: string;

  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority!: string;

  @IsString()
  assignee!: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}