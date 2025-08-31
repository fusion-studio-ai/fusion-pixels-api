import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'
import { AIProvider } from '../ai.service'

export class EnhancePromptDto {
  @IsString()
  @IsNotEmpty()
  prompt: string

  @IsOptional()
  @IsString()
  category?: string = 'general'

  @IsOptional()
  @IsString()
  style?: string = 'photorealistic'

  @IsOptional()
  @IsEnum(AIProvider)
  provider?: AIProvider = AIProvider.GOOGLE
}
