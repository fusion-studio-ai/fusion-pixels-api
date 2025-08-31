import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator'

export class SuggestPromptsDto {
  @IsString()
  @IsNotEmpty()
  category: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  count?: number = 3
}
