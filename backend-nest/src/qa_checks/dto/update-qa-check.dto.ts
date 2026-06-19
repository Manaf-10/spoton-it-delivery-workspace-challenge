import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateQaCheckDto {
  @IsOptional()
  @IsString()
  workItemId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  testTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  expectedResult?: string;

  @IsOptional()
  @IsString()
  actualResult?: string;

  @IsOptional()
  @IsIn(['pending', 'passed', 'failed'])
  status?: string;

  @IsOptional()
  @IsString()
  tester?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
