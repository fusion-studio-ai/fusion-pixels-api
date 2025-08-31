import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { AIModel } from './enums/ai-provider.enum'

export enum AIProvider {
  GOOGLE = 'google',
}

export interface EnhancePromptRequest {
  prompt: string
  category?: string
  style?: string
}

export interface GenerateImageRequest {
  prompt: string
  enhancedPrompt?: string
  settings?: {
    style?: 'photorealistic' | 'artistic' | 'cartoon'
    ratio?: '1:1' | '16:9' | '9:16' | '4:3'
    quality?: 'standard' | 'hd'
    seed?: number
  }
}

export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    provider: string
    model: string
    processingTime: number
    tokensUsed?: number
  }
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name)

  constructor(private readonly configService: ConfigService) {
    this.logger.log('AIService initialized with Google Gemini 2.0 Flash')
  }

  /**
   * Get Google Gemini 2.0 Flash model instance
   */
  private getGeminiFlashModel() {
    const apiKey = this.configService.get<string>('GOOGLE_GENERATIVE_AI_API_KEY')

    if (!apiKey) {
      throw new Error('Google AI API key not configured')
    }

    // Use Gemini 2.0 Flash - the fastest model
    return google(AIModel.GEMINI_2_FLASH)
  }

  /**
   * Enhanced prompt generation using Gemini 2.0 Flash
   */
  async enhancePrompt(request: EnhancePromptRequest): Promise<AIResponse<string>> {
    const startTime = Date.now()
    const { prompt, category = 'general', style = 'photorealistic' } = request

    try {
      this.logger.debug(`Enhancing prompt with Gemini 2.0 Flash: "${prompt.substring(0, 50)}..."`)

      const model = this.getGeminiFlashModel()

      const result = await generateText({
        model,
        prompt: `You are an expert prompt engineer for AI image generation. You specialize in creating highly detailed, optimized prompts.

Original prompt: "${prompt}"
Category: ${category}
Style preference: ${style}

Transform this into a professional AI image generation prompt:

Enhancement Rules:
1. Add specific visual details: lighting, composition, perspective
2. Include technical photography terms: "shot with", lens specs, camera settings
3. Add quality boosters: "high detail", "8K", "professional photography", "award-winning"
4. Specify style descriptors that match the category
5. Include mood and atmosphere details
6. Add artistic techniques if relevant: "depth of field", "bokeh", "golden ratio composition"
7. Keep under 150 words but be descriptive
8. Optimize for DALL-E 3, Midjourney, and Stable Diffusion

Return ONLY the enhanced prompt, no explanations:`,
        maxOutputTokens: 200,
        temperature: 0.8, // Higher creativity for better prompts
      })

      const processingTime = Date.now() - startTime

      this.logger.debug(`Prompt enhanced in ${processingTime}ms with Gemini 2.0 Flash`)

      return {
        success: true,
        data: result.text.trim(),
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime,
          tokensUsed: result.usage?.totalTokens,
        },
      }
    } catch (error) {
      this.logger.error(`Prompt enhancement failed with Gemini 2.0 Flash:`, error.message)

      return {
        success: false,
        error: error.message,
        data: prompt, // Fallback to original
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
        },
      }
    }
  }

  /**
   * Generate creative prompt suggestions using Gemini 2.0 Flash
   */
  async generatePromptSuggestions(category: string, count: number = 3): Promise<AIResponse<string[]>> {
    const startTime = Date.now()

    try {
      const model = this.getGeminiFlashModel()

      const result = await generateText({
        model,
        prompt: `Generate ${count} creative and highly detailed image prompts for ${category} imagery.

Each prompt should be:
- 30-60 words long
- Professionally detailed with specific visual elements
- Include lighting, mood, composition details
- Add technical photography specifications
- Optimized for AI image generation (DALL-E 3, Midjourney, Stable Diffusion)
- Unique and diverse in approach
- Include quality keywords like "8K", "professional", "award-winning"

Category: ${category}

Format as numbered list:
1. [First detailed prompt with technical specs]
2. [Second detailed prompt with different style/mood]  
3. [Third detailed prompt with unique perspective]`,
        maxOutputTokens: 500,
        temperature: 1.0, // Maximum creativity for diverse suggestions
      })

      const suggestions = result.text
        .split('\n')
        .filter((line) => line.trim() && /^\d+\./.test(line))
        .map((line) => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count)

      return {
        success: true,
        data: suggestions,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
        },
      }
    } catch (error) {
      this.logger.error('Prompt suggestions failed with Gemini 2.0 Flash:', error.message)

      return {
        success: false,
        error: error.message,
        data: [],
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
        },
      }
    }
  }

  /**
   * Process image generation request (enhanced prompt output)
   */
  async generateImage(
    request: GenerateImageRequest
  ): Promise<AIResponse<{ enhancedPrompt: string; optimizedForDalle: string }>> {
    const startTime = Date.now()
    const { prompt, enhancedPrompt, settings } = request

    try {
      let finalPrompt = enhancedPrompt

      // Auto-enhance if not provided
      if (!finalPrompt) {
        const enhanceResult = await this.enhancePrompt({
          prompt,
          category: this.inferCategory(prompt),
          style: settings?.style || 'photorealistic',
        })

        if (enhanceResult.success) {
          finalPrompt = enhanceResult.data
        } else {
          finalPrompt = prompt
        }
      }

      // Create DALL-E 3 optimized version
      const dalleOptimized = await this.optimizeForDallE(finalPrompt ?? prompt, settings)

      return {
        success: true,
        data: {
          enhancedPrompt: finalPrompt ?? prompt,
          optimizedForDalle: dalleOptimized,
        },
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
        },
      }
    } catch (error) {
      this.logger.error(`Image processing failed:`, error.message)

      return {
        success: false,
        error: error.message,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
        },
      }
    }
  }

  /**
   * Optimize prompt specifically for DALL-E 3
   */
  private async optimizeForDallE(prompt: string, settings?: any): Promise<string> {
    try {
      const model = this.getGeminiFlashModel()

      const result = await generateText({
        model,
        prompt: `Optimize this image prompt specifically for DALL-E 3:

Original: "${prompt}"
Aspect Ratio: ${settings?.ratio || '1:1'}
Style: ${settings?.style || 'photorealistic'}
Quality: ${settings?.quality || 'standard'}

DALL-E 3 optimization rules:
1. Keep under 400 characters (DALL-E 3 limit)
2. Be very specific about visual elements
3. Use clear, descriptive language
4. Avoid abstract concepts
5. Include lighting and mood descriptors
6. Specify camera angle/perspective
7. Add quality keywords: "high quality", "detailed", "professional"

Return the optimized DALL-E 3 prompt:`,
        maxOutputTokens: 150,
        temperature: 0.5, // Lower for more focused optimization
      })

      return result.text.trim()
    } catch (error) {
      this.logger.warn('DALL-E optimization failed, using original prompt')
      return prompt
    }
  }

  /**
   * Infer category from prompt
   */
  private inferCategory(prompt: string): string {
    const categories = {
      automotive: ['car', 'vehicle', 'auto', 'truck', 'motorcycle', 'ferrari', 'tesla'],
      portrait: ['person', 'face', 'portrait', 'human', 'woman', 'man', 'child'],
      landscape: ['mountain', 'ocean', 'forest', 'desert', 'nature', 'sunset', 'sunrise'],
      architecture: ['building', 'house', 'city', 'urban', 'structure', 'tower'],
      food: ['food', 'meal', 'restaurant', 'cooking', 'kitchen', 'dish'],
      fashion: ['fashion', 'clothing', 'style', 'model', 'dress', 'outfit'],
      technology: ['tech', 'computer', 'phone', 'gadget', 'device', 'digital'],
    }

    const lowerPrompt = prompt.toLowerCase()

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => lowerPrompt.includes(keyword))) {
        return category
      }
    }

    return 'general'
  }

  /**
   * Check Gemini 2.0 Flash health
   */
  async checkProviderHealth(): Promise<boolean> {
    try {
      const model = this.getGeminiFlashModel()

      await generateText({
        model,
        prompt: 'Test connection',
        maxOutputTokens: 5,
      })

      this.logger.debug('Gemini 2.0 Flash health check passed')
      return true
    } catch (error) {
      this.logger.warn('Gemini 2.0 Flash health check failed:', error.message)
      return false
    }
  }

  /**
   * Get provider info
   */
  getProviderInfo() {
    return {
      provider: AIProvider.GOOGLE,
      model: AIModel.GEMINI_2_FLASH,
      capabilities: [
        'Ultra-fast text generation',
        'Advanced prompt enhancement',
        'Creative suggestions',
        'Multi-language support',
        'DALL-E 3 optimization',
        'Category-aware processing',
      ],
      features: {
        speed: 'Ultra-fast (2.0 Flash)',
        quality: 'High',
        costEfficiency: 'Excellent',
        creativity: 'Very High',
      },
      note: 'Gemini 2.0 Flash provides the fastest AI-powered prompt enhancement for image generation.',
    }
  }

  /**
   * Analyze and improve existing prompt
   */
  async analyzePrompt(prompt: string): Promise<
    AIResponse<{
      analysis: string
      improvements: string[]
      score: number
    }>
  > {
    const startTime = Date.now()

    try {
      const model = this.getGeminiFlashModel()

      const result = await generateText({
        model,
        prompt: `Analyze this AI image generation prompt and provide improvement suggestions:

Prompt: "${prompt}"

Provide:
1. Analysis: What's good and what's missing
2. Improvements: 3-5 specific suggestions
3. Score: Rate the prompt quality from 1-10

Format as JSON:
{
  "analysis": "detailed analysis",
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "score": 7
}`,
        maxOutputTokens: 300,
        temperature: 0.3,
      })

      const parsed = JSON.parse(result.text)

      return {
        success: true,
        data: parsed,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
        },
      }
    } catch (error) {
      this.logger.error('Prompt analysis failed:', error.message)

      return {
        success: false,
        error: error.message,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
        },
      }
    }
  }
}
