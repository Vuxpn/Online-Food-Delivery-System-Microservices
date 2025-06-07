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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiBearerAuth()
  @Roles('SELLER')
  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return await this.productService.createProduct({
      ...createProductDto,
      createdBy: userId,
    });
  }

  @ApiOperation({ summary: 'Get the list of products of the user' })
  @ApiBearerAuth()
  @Roles('SELLER')
  @Get()
  async getMyProducts(@Request() req) {
    const userId = req.user.id;
    return await this.productService.getProductsByUser(userId);
  }

  @ApiOperation({ summary: 'Update a product' })
  @ApiBearerAuth()
  @Roles('SELLER')
  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return await this.productService.updateProduct(
      id,
      updateProductDto,
      userId,
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
