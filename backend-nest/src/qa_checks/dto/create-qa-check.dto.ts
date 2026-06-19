import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateQaCheckDto {
  @IsString()
  workItemId!: string;

  @IsString()
  @MinLength(3)
  testTitle!: string;

  @IsString()
  @MinLength(3)
  expectedResult!: string;

  @IsOptional()
  @IsString()
  actualResult?: string;

  @IsIn(['pending', 'passed', 'failed'])
  status!: string;

  @IsString()
  tester!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
