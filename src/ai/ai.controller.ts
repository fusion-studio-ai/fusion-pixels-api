import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AIService } from './ai.service'

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('enhance-prompt')
  @HttpCode(HttpStatus.OK)
  async enhancePrompt(@Body() body: any) {
    const result = await this.aiService.enhancePrompt(body)
    return {
      ...result,
      original: body.prompt,
      model: 'gemini-2.0-flash-exp',
    }
  }

  @Post('generate-image')
  @HttpCode(HttpStatus.OK)
  async generateImage(@Body() body: any) {
    const result = await this.aiService.generateImage(body)

    return {
      ...result,
      originalPrompt: body.prompt,
      model: 'gemini-2.0-flash-exp',
      note: 'Enhanced with Gemini 2.0 Flash. Use optimizedForDalle with DALL-E 3 for best results.',
    }
  }

  @Post('suggest-prompts')
  @HttpCode(HttpStatus.OK)
  async suggestPrompts(@Body() body: any) {
    return this.aiService.generatePromptSuggestions(body.category, body.count || 3)
  }

  @Post('analyze-prompt')
  @HttpCode(HttpStatus.OK)
  async analyzePrompt(@Body() body: { prompt: string }) {
    return this.aiService.analyzePrompt(body.prompt)
  }

  @Get('health')
  async checkHealth() {
    const isHealthy = await this.aiService.checkProviderHealth()
    const providerInfo = this.aiService.getProviderInfo()

    return {
      gemini_2_flash: isHealthy,
      providerInfo,
      timestamp: new Date().toISOString(),
    }
  }

  @Get('info')
  getProviderInfo() {
    return this.aiService.getProviderInfo()
  }
}
