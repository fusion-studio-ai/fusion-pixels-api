import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { AIService } from './ai.service'

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  // ============================================
  // TEXT GENERATION ENDPOINTS
  // ============================================

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

  // ============================================
  // IMAGE GENERATION ENDPOINTS
  // ============================================

  @Post('generate-image')
  @HttpCode(HttpStatus.OK)
  async generateImageFromText(@Body() body: any) {
    const result = await this.aiService.generateImageFromText(body)

    return {
      ...result,
      note: 'Generated using AI SDK native Google provider with Gemini 2.5 Flash Image Preview',
    }
  }

  @Post('edit-image')
  @HttpCode(HttpStatus.OK)
  async editImageWithText(@Body() body: any) {
    const result = await this.aiService.editImageWithText(body)

    return {
      ...result,
      operation: body.operation || 'modify',
      note: 'Image edited using AI SDK native image capabilities',
    }
  }

  @Post('compose-images')
  @HttpCode(HttpStatus.OK)
  async composeMultipleImages(@Body() body: any) {
    const result = await this.aiService.composeMultipleImages(body)

    return {
      ...result,
      compositionType: body.compositionType || 'merge',
      inputImageCount: body.images?.length || 0,
      note: 'Images composed using AI SDK multi-image capabilities',
    }
  }

  @Post('refine-image')
  @HttpCode(HttpStatus.OK)
  async refineImageIteratively(@Body() body: any) {
    const result = await this.aiService.refineImageIteratively(body)

    return {
      ...result,
      refinementType: body.refinementType || 'adjust',
      conversationTurn: (body.conversationHistory?.length || 0) + 1,
      note: 'Image refined using AI SDK iterative capabilities',
    }
  }

  @Post('generate-text-image')
  @HttpCode(HttpStatus.OK)
  async generateHighFidelityText(@Body() body: any) {
    const result = await this.aiService.generateHighFidelityText(body)

    return {
      ...result,
      textContent: body.text,
      designStyle: body.style,
      note: 'High-fidelity text image generated with perfect typography',
    }
  }

  // ============================================
  // ADVANCED FEATURES
  // ============================================

  @Post('generate-with-search')
  @HttpCode(HttpStatus.OK)
  async generateWithSearch(@Body() body: { prompt: string; searchQuery?: string }) {
    const result = await this.aiService.generateImageWithSearch(body.prompt, body.searchQuery)

    return {
      ...result,
      searchQuery: body.searchQuery,
      note: 'Generated with Google Search grounding for latest information',
    }
  }

  @Post('generate-from-url')
  @HttpCode(HttpStatus.OK)
  async generateFromUrl(@Body() body: { prompt: string; url: string }) {
    const result = await this.aiService.generateImageFromUrl(body.prompt, body.url)

    return {
      ...result,
      sourceUrl: body.url,
      note: 'Generated from URL context using AI SDK URL tool',
    }
  }

  // ============================================
  // FILE UPLOAD ENDPOINTS
  // ============================================

  @Post('upload-and-edit')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  async uploadAndEditImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { prompt: string; operation?: string; includeText?: boolean }
  ) {
    if (!file) {
      return { success: false, error: 'No image file provided' }
    }

    // Convert uploaded file to base64
    const base64Image = file.buffer.toString('base64')

    const result = await this.aiService.editImageWithText({
      prompt: body.prompt,
      baseImage: base64Image,
      operation: body.operation as any,
      includeText: body.includeText,
    })

    return {
      ...result,
      uploadedFile: {
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
      note: 'Image uploaded and edited using AI SDK native capabilities',
    }
  }

  @Post('upload-and-compose')
  @UseInterceptors(FilesInterceptor('images', 10))
  @HttpCode(HttpStatus.OK)
  async uploadAndComposeImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { prompt: string; compositionType?: string; includeText?: boolean }
  ) {
    if (!files || files.length === 0) {
      return { success: false, error: 'No image files provided' }
    }

    // Convert uploaded files to base64
    const base64Images = files.map((file) => file.buffer.toString('base64'))

    const result = await this.aiService.composeMultipleImages({
      prompt: body.prompt,
      images: base64Images,
      compositionType: body.compositionType as any,
      includeText: body.includeText,
    })

    return {
      ...result,
      uploadedFiles: files.map((file) => ({
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      })),
      note: 'Images uploaded and composed using AI SDK multi-image features',
    }
  }

  // ============================================
  // UTILITY ENDPOINTS
  // ============================================

  @Get('health')
  async checkHealth() {
    const textHealth = await this.aiService.checkProviderHealth()
    const imageHealth = await this.aiService.checkImageGenerationHealth()
    const providerInfo = this.aiService.getProviderInfo()

    return {
      textGeneration: textHealth,
      imageGeneration: imageHealth,
      overall: textHealth && imageHealth,
      providerInfo,
      timestamp: new Date().toISOString(),
    }
  }

  @Get('info')
  async getProviderInfo() {
    return this.aiService.getProviderInfo()
  }

  @Get('capabilities')
  async getCapabilities() {
    return {
      textGeneration: {
        promptEnhancement: true,
        creativeSuggestions: true,
        promptAnalysis: true,
        multiLanguage: true,
        conversational: true,
        structuredOutput: true,
      },
      imageGeneration: {
        textToImage: true,
        imageEditing: true,
        multiImageComposition: true,
        iterativeRefinement: true,
        highFidelityText: true,
        styleTransfer: true,
        inpainting: true,
        productMockups: true,
        logoDesign: true,
        commercialPhotography: true,
        searchGrounding: true,
        urlContext: true,
        safetyFiltering: true,
        nativeFileHandling: true,
      },
      supportedStyles: ['photorealistic', 'artistic', 'minimalist', 'commercial', 'logo', 'cartoon'],
      supportedOperations: ['add', 'remove', 'modify', 'style_transfer', 'inpaint'],
      supportedCompositions: ['merge', 'style_transfer', 'product_mockup', 'collage'],
      supportedTextStyles: ['logo', 'poster', 'banner', 'business_card', 'social_media'],
      advancedFeatures: [
        'google_search_grounding',
        'url_context',
        'file_uploads',
        'batch_processing',
        'conversation_history',
        'safety_ratings',
      ],
    }
  }
}
