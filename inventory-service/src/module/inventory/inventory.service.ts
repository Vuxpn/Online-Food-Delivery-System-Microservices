import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductCreatedEvent } from '../../interface/product.interface';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(productData: ProductCreatedEvent) {
    try {
      const product = await this.prisma.product.create({
        data: {
          productId: productData.productId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          quantity: productData.quantity,
          category: productData.category,
          images: productData.images || [],
          createdBy: productData.createdBy,
          createdAt: new Date(productData.createdAt),
        },
      });

      console.log(`Product ${product.name} created successfully in inventory`);
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(updateData: any) {
    try {
      const { id, userId, ...dataToUpdate } = updateData;

      const existingProduct = await this.prisma.product.findFirst({
        where: { id, createdBy: userId },
      });

      if (!existingProduct) {
        throw new Error('Product not found or unauthorized');
      }

      const updateFields: any = {};
      if (dataToUpdate.name) updateFields.name = dataToUpdate.name;
      if (dataToUpdate.description)
        updateFields.description = dataToUpdate.description;
      if (dataToUpdate.price) updateFields.price = dataToUpdate.price;
      if (dataToUpdate.quantity) updateFields.quantity = dataToUpdate.quantity;
      if (dataToUpdate.category) updateFields.category = dataToUpdate.category;
      if (dataToUpdate.images) updateFields.images = dataToUpdate.images;
      updateFields.updatedAt = new Date();

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: updateFields,
      });

      console.log('Product updated:', updatedProduct);
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(deleteData: any) {
    try {
      const { id, userId } = deleteData;

      const existingProduct = await this.prisma.product.findFirst({
        where: { id, createdBy: userId },
      });

      if (!existingProduct) {
        throw new Error(
          'Product not found or you do not have permission to delete',
        );
      }

      await this.prisma.product.delete({
        where: { id },
      });

      console.log(`Product ${id} deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async updateInventoryAfterDelivery(orderData: any) {
    try {
      for (const item of orderData.items) {
        await this.updateProductQuantity(
          item.productId,
          -item.quantity,
          'Order delivered',
          orderData.orderId,
        );
      }

      console.log(`Update inventory after order ${orderData.orderId}`);
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  }

  async handleOrderCancelled(cancelData: any) {
    try {
      console.log(`Handle order cancelled ${cancelData.orderId}`);
    } catch (error) {
      console.error('Error handling order cancelled:', error);
    }
  }

  private async updateProductQuantity(
    productId: string,
    quantityChange: number,
    reason: string,
    orderId?: string,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
    });

    if (!product) {
      throw new Error(`Product not found with ID: ${productId}`);
    }

    const newQuantity = product.quantity + quantityChange;

    if (newQuantity < 0) {
      throw new Error(`Not enough inventory for product: ${product.name}`);
    }

    await this.prisma.product.update({
      where: { productId },
      data: { quantity: newQuantity },
    });

    await this.prisma.inventoryHistory.create({
      data: {
        productId,
        orderId,
        oldQuantity: product.quantity,
        newQuantity,
        reason,
      },
    });
  }

  async getProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductsByUser(userId: string) {
    return this.prisma.product.findMany({
      where: { createdBy: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }
}
