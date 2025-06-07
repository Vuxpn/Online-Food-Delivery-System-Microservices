import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from '../../dto/product.dto';
import { JwtAuthGuard } from '../../guard/jwt-auth.guard';
import { RolesGuard } from '../../guard/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  EventPattern,
  Payload,
  Ctx,
  KafkaContext,
} from '@nestjs/microservices';

@ApiTags('Product')
@Controller('product')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Create a new product with images' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data with images',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Pho' },
        description: { type: 'string', example: 'Pho Bo Tai' },
        price: { type: 'number', example: 50000 },
        quantity: { type: 'number', example: 100 },
        category: { type: 'string', example: 'Food' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload multiple images (maximum 5)',
        },
      },
    },
  })
  @ApiBearerAuth()
  @Roles('SELLER')
  @Post()
  @UseInterceptors(FilesInterceptor('images', 5))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const userId = req.user.id;
    return await this.productService.createProduct(
      {
        ...createProductDto,
        createdBy: userId,
      },
      files,
    );
  }

  @ApiOperation({ summary: 'Get the list of products of the user' })
  @ApiBearerAuth()
  @Roles('SELLER')
  @Get()
  async getMyProducts(@Request() req) {
    const userId = req.user.id;
    return await this.productService.getProductsByUser(userId);
  }

  @ApiOperation({ summary: 'Update a product with new images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product update data with images',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Pho' },
        description: { type: 'string', example: 'Pho Bo Tai' },
        price: { type: 'number', example: 50000 },
        quantity: { type: 'number', example: 100 },
        category: { type: 'string', example: 'Food' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload new images (will replace existing ones)',
        },
      },
    },
  })
  @ApiBearerAuth()
  @Roles('SELLER')
  @Put(':id')
  @UseInterceptors(FilesInterceptor('images', 5))
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const userId = req.user.id;
    return await this.productService.updateProduct(
      id,
      updateProductDto,
      userId,
      files,
    );
  }

  @ApiOperation({ summary: 'Delete a product' })
  @ApiBearerAuth()
  @Roles('SELLER')
  @Delete(':id')
  async deleteProduct(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return await this.productService.deleteProduct(id, userId);
  }

  @ApiOperation({ summary: 'Get the list of all products' })
  @ApiBearerAuth()
  @Get('all')
  async getAllProducts() {
    return await this.productService.getAllProducts();
  }

  @ApiOperation({ summary: 'Get the product by id' })
  @ApiBearerAuth()
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return await this.productService.getProductById(id);
  }

  @EventPattern('product.statusupdated')
  async handleProductStatusUpdated(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received product.status_updated event:', message);
  }
}
