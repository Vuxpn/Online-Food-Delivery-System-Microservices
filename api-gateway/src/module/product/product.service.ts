import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateProductDto, UpdateProductDto } from 'src/dto/product.dto';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.kafkaClient.subscribeToResponseOf('get.allproducts');
    this.kafkaClient.subscribeToResponseOf('get.productsbyuser');
    this.kafkaClient.subscribeToResponseOf('get.productbyid');
  }

  async createProduct(
    createProductDto: CreateProductDto & { createdBy: string },
    files?: Express.Multer.File[],
  ) {
    try {
      const productId = uuidv4();
      let imageUrls: string[] = [];

      if (files && files.length > 0) {
        imageUrls = await this.cloudinaryService.uploadMultipleFiles(files);
      }

      const productData = {
        productId,
        ...createProductDto,
        images: imageUrls,
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
      throw new HttpException(
        'Failed to create product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

  async getProductById(id: string) {
    try {
      const response = await lastValueFrom(
        this.kafkaClient.send('get.productbyid', { id }),
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
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
    files?: Express.Multer.File[],
  ) {
    try {
      let imageUrls: string[] = [];

      if (files && files.length > 0) {
        imageUrls = await this.cloudinaryService.uploadMultipleFiles(files);
      }

      const updateData = {
        id,
        userId,
        ...updateProductDto,
        ...(imageUrls.length > 0 && { images: imageUrls }),
        updatedAt: new Date().toISOString(),
      };

      this.kafkaClient.emit('product.updated', {
        key: userId,
        value: updateData,
      });

      return {
        message: 'Product updated successfully',
        id,
        updatedFields: updateData,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to update product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteProduct(id: string, userId: string) {
    try {
      const deleteData = {
        id,
        userId,
        deletedAt: new Date().toISOString(),
      };

      this.kafkaClient.emit('product.deleted', {
        key: userId,
        value: deleteData,
      });

      return {
        message: 'Product deleted successfully',
        id,
      };
    } catch (error) {
      throw new HttpException(
        'Cannot delete product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
