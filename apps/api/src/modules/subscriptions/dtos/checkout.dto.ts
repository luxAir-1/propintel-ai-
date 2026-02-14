import { IsString, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'Stripe price ID (e.g., price_1Abc...)',
    example: 'price_1IB15sI2vYt1L20k1qKO3w7p',
  })
  @IsString()
  @IsNotEmpty()
  priceId!: string;

  @ApiProperty({
    description: 'URL to redirect to on success',
    example: 'https://example.com/billing/success',
  })
  @IsUrl()
  @IsNotEmpty()
  successUrl!: string;

  @ApiProperty({
    description: 'URL to redirect to on cancel',
    example: 'https://example.com/billing/cancel',
  })
  @IsUrl()
  @IsNotEmpty()
  cancelUrl!: string;
}
