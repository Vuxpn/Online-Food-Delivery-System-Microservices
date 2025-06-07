import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateProductDto, UpdateProductDto } from 'src/dto/product.dto';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ProductService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    this.kafkaClient.subscribeToResponseOf('get.productsbyuser');
    this.kafkaClient.subscribeToResponseOf('get.productbyid');
    this.kafkaClient.subscribeToResponseOf('get.allproducts');
  }

  async createProduct(
    createProductDto: CreateProductDto & { createdBy: string },
  ) {
    try {
      const productId = uuidv4();
      const productData = {
        productId,
        ...createProductDto,
        createdAt: new Date().toISOString(),
      };

      this.kafkaClient.emit('product.created', {
        key: createProductDto.createdBy,
        value: productData,
      });

      return {
        message: 'Product created successfully',
        ...productData,
      };
    } catch (error) {
      throw new Error('Cannot create product');
    }
  }

  async getAllProducts() {
    try {
      const response = await lastValueFrom(
        this.kafkaClient.send('get.allproducts', {}),
      ).catch(() => null);

      return {
        message: 'All products retrieved successfully',
        products: response || [],
      };
    } catch (error) {
      throw new HttpException(
        'Cannot get products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductsByUser(userId: string) {
    try {
      const response = await lastValueFrom(
        this.kafkaClient.send('get.productsbyuser', { userId }),
      ).catch(() => null);

      return {
        message: 'User products retrieved successfully',
        products: response || [],
      };
    } catch (error) {
      throw new HttpException(
        'Cannot get user products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductById(productId: string) {
    try {
      const response = await lastValueFrom(
        this.kafkaClient.send('get.productbyid', { productId }),
      ).catch(() => null);

      if (!response) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      return {
        message: 'Product retrieved successfully',
        product: response,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Cannot get product',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ) {
    try {
      const updateData = {
        productId,
        userId,
        ...updateProductDto,
        updatedAt: new Date().toISOString(),
      };

      this.kafkaClient.emit('product.updated', {
        key: userId,
        value: updateData,
      });

      return {
        message: 'Product updated successfully',
        productId,
        updatedFields: updateProductDto,
      };
    } catch (error) {
      throw new HttpException(
        'Cannot update product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteProduct(productId: string, userId: string) {
    try {
      this.kafkaClient.emit('product.deleted', {
        key: userId,
        value: {
          productId,
          userId,
          deletedAt: new Date().toISOString(),
        },
      });

      return {
        message: 'Product deleted successfully',
        productId,
      };
    } catch (error) {
      throw new HttpException(
        'Cannot delete product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
