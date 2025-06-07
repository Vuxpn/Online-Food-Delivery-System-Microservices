import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'The ID of the product',
    example: '123',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'The name of the product',
    example: 'Product Name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The quantity of the product',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'The price of the product',
    example: 100000,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'The ID of the user',
    example: 'vu',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The items of the order',
    example: [
      { productId: '123', name: 'Product Name', quantity: 1, price: 100000 },
    ],
  })
  @IsArray()
  items: CreateOrderItemDto[];

  @ApiProperty({
    description: 'The note of the order',
    example: 'Note',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'The shipping address of the order',
    example: 'Hanoi, Vietnam',
  })
  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @ApiProperty({
    description: 'The total amount of the order',
    example: 100000,
  })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;
}
