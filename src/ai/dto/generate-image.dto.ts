import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator'
import { AIProvider } from '../ai.service'

class ImageSettingsDto {
  @IsOptional()
  @IsEnum(['photorealistic', 'artistic', 'cartoon'])
  style?: 'photorealistic' | 'artistic' | 'cartoon'

  @IsOptional()
  @IsEnum(['1:1', '16:9', '9:16', '4:3'])
  ratio?: '1:1' | '16:9' | '9:16' | '4:3'

  @IsOptional()
  @IsEnum(['standard', 'hd'])
  quality?: 'standard' | 'hd'

  @IsOptional()
  seed?: number
}

export class GenerateImageDto {
  @IsString()
  @IsNotEmpty()
  prompt: string

  @IsOptional()
  @IsString()
  enhancedPrompt?: string

  @IsOptional()
  @IsEnum(AIProvider)
  provider?: AIProvider = AIProvider.GOOGLE

  @IsOptional()
  @IsObject()
  settings?: ImageSettingsDto
}
