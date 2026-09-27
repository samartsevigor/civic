import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { IssueStatus } from '../issue.enums';

export class UpdateIssueStatusDto {
  @IsEnum(IssueStatus)
  status: IssueStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  publicNote?: string;
}
